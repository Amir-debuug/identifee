import { v4 as uuidv4 } from 'uuid';
import { Sequelize, Op } from 'sequelize';
import moment from 'moment-timezone';

import { Activities, Feed } from '../database';
import { getResourceTypeWithId } from 'lib/utils/utils';
import ParseSequelizeResponse from 'lib/utils/parseSequelizeResponse';
import { AuthUser } from 'lib/middlewares/auth';
import { feedLogServiceFactory } from './feed';
import { ExpandModel } from 'lib/database/helpers';
import { FeedModel } from 'lib/database/models/feed';
import Base, { SequelizeOpts } from './utils/Base';
import { ActivitiesModel } from 'lib/database/models/activities';
import { getUrl } from 'lib/middlewares/emitter/tasks/utils';
import { extendAs } from 'lib/middlewares/context';
import { send } from 'lib/middlewares/emitter';

class ActivityService extends Base<ActivitiesModel> {
  async findAllByFeedId(feedId: string) {
    const activities = await this.model.findAll({
      where: {
        feed_id: feedId,
      },
    });

    return this.rowsToJSON(activities);
  }

  async addActivity(data: any) {
    const feedLogService = feedLogServiceFactory(this.user);

    // TODO this is hacky, clean this up. data.userId is when this.user.id is guest
    const userId = this.user.id ? this.user.id : data.userId;
    delete data.userId;

    const {
      repeat,
      online_meet = false,
      priority = false,
      organization_id = null,
      deal_id = null,
      contact_id = null,
      rich_note = null,
      ...dataObject
    } = data || {};

    function capitalizeFirstLetter(str: string) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function mapping(repeat: string) {
      const splitRepeat = repeat.split(';');
      const array = splitRepeat.map((str) => {
        const object: any = {};
        const strArr = str.split('=');
        object[strArr[0].trim()] = strArr[1].trim();
        return object;
      });

      return array.reduce((res, cur) => Object.assign(res, cur), {});
    }

    function stringToDate(str: string) {
      const [year, month, day] = str.split('-');
      return new Date(+year, parseInt(month) - 1, +day);
    }

    function getDaysArray(start: Date, end: Date, interval: number) {
      const arr = [];
      for (const dt = start; dt <= end; dt.setDate(dt.getDate() + interval)) {
        arr.push(new Date(dt));
      }
      return arr;
    }

    const body = {
      assigned_user_id: userId,
      modified_user_id: userId,
      created_by: userId,
      organization_id,
      deal_id,
      contact_id,
      rich_note,
      tenant_id: this.user.tenant,
      online_meet,
      priority,
    };

    let dates;
    let activities;

    if (repeat) {
      const repeatObj = mapping(repeat);
      const FREQ: any = { DAILY: 1, WEEKLY: 7, MONTHLY: 30, YEARLY: 365 };
      const interval = FREQ[repeatObj.FREQ];
      const start = stringToDate(repeatObj.DTSTART);
      const until = stringToDate(repeatObj.UNTIL);
      dates = getDaysArray(start, until, interval);
      const newActivities = await Promise.all(
        dates.map((date: Date) => {
          return feedLogService.create({
            ...body,
            tenant_id: this.user.tenant,
            type: dataObject.type,
            summary: `${capitalizeFirstLetter(dataObject.type)} Added`,
            object_data: {
              id: uuidv4(),
              rich_note: body.rich_note,
              ...dataObject,
              start_date: date,
              end_date: date,
              done: dataObject.done || false,
              priority: priority,
              online_meet: online_meet,
            },
          });
        })
      );

      activities = dates.map((date: Date, index) => {
        return {
          id: uuidv4(),
          ...body,
          ...dataObject,
          feed_id: newActivities[index]?.id,
          start_date: date.toString(),
        };
      });
    } else {
      const newActivity = await feedLogService.create({
        ...body,
        tenant_id: this.user.tenant,
        type: dataObject.type,
        summary: `${capitalizeFirstLetter(dataObject.type)} Added`,
        object_data: {
          id: uuidv4(),
          start_date: new Date(),
          rich_note: body.rich_note,
          ...dataObject,
          done: dataObject.done || false,
          priority: priority,
          online_meet: online_meet,
        },
      });
      activities = [
        {
          id: uuidv4(),
          ...body,
          ...dataObject,
          feed_id: newActivity.id,
        },
      ];
    }

    const createdActivities = await Activities.bulkCreate(activities);

    return this.rowsToJSON(createdActivities);
  }

  async sendActivitiesReminder(dateFrom: any, dateTo: any) {
    const activities = await Activities.findAll({
      where: {
        created_by: this.user.id,
        deleted_on: null,
        [Op.and]: [
          {
            start_date: {
              [Op.gte]: dateFrom,
            },
          },
          {
            start_date: {
              [Op.lt]: dateTo,
            },
          },
        ],
      },
      order: [['start_date', 'ASC']],
    });

    const parsedActivities = ParseSequelizeResponse(activities);
    if (parsedActivities.length > 0) {
      const reminderInfo = await Promise.all(
        parsedActivities.map(async (activity: any) => {
          const userReq = await extendAs(this.user, {});

          const resource = getResourceTypeWithId({
            contact_id: activity.contact_id,
            organization_id: activity.organization_id,
            deal_id: activity.deal_id,
          });
          const genericResource = await userReq.services.biz[
            resource.type
          ].getOneById(undefined, resource.id);

          return {
            resource_id: resource.id,
            resourceType: resource.type,
            resourceUrl: getUrl(resource.type, resource.id),
            resource: genericResource,
            title: activity.name,
            description: activity.notes,
            busyStatus: activity.free_busy?.toUpperCase(),
            attendees: activity?.guests?.split(',').length,
            location: activity.location || activity.conference_link,
            start: moment(new Date(activity.start_date))
              .format('YYYY-M-D-H-m')
              .split('-')
              .map((item) => Number(item)),
            date: moment(activity.start_date).format('MMM DD YYYY h:mm A'),
            user_id: activity.assigned_user_id,
          };
        })
      );

      await send(this.user, {
        event: 'REMINDER_CREATED',
        payload: {
          activities: reminderInfo,
          tenant_id: this.user.tenant,
          user_id: this.user.id,
        },
      });
    }
  }

  async updateActivityFeed(
    feed: ReturnType<ExpandModel<FeedModel>['toJSON']>,
    ActivityId: string,
    data: any
  ) {
    const feedLogService = feedLogServiceFactory(this.user);

    const { organization_id, deal_id } = feed;

    const { contact_id, start_date, rich_note, ...dataObject } = data || {};

    const body = {
      modified_user_id: this.user.id,
      contact_id: dataObject.contact_id || contact_id,
      organization_id: dataObject.organization_id || organization_id,
      deal_id: dataObject.deal_id || deal_id,
      updated_by: this.user.id,
      start_date,
      rich_note,
    };

    await feedLogService.updateById(feed.id, {
      ...body,
      type: dataObject.type,
      summary: 'Activity updated',
      object_data: {
        id: ActivityId,
        start_date: body.start_date,
        contact_info: feed.object_data?.contact_info,
        rich_note: body.rich_note,
        ...dataObject,
      },
    });

    return await Activities.update(
      {
        ...body,
        ...dataObject,
        feed_id: feed.id,
      },
      {
        where: {
          id: ActivityId,
        },
      }
    );
  }

  /**
   * TODO possible security issue
   */
  async getActivities({
    // contactId,
    organizationId,
    dealId,
    limit = 15,
    page = 1,
    done,
    oldest,
  }: any) {
    const where = this.getWhere();
    where.deleted_on = null;

    // if (contactId) where['contact_id'] = contactId;
    if (organizationId) where['organization_id'] = organizationId;
    if (dealId) where['deal_id'] = dealId;
    if (typeof JSON.parse(done) === 'boolean') where.done = done;

    const data = await Activities.findAndCountAll({
      where,
      attributes: {
        include: [
          [
            Sequelize.literal(`"activities"."start_date" at Time zone 'UTC'`),
            'start_date',
          ],
        ],
      },
      limit,
      offset: limit * (page - 1),
      include: 'feed',
      distinct: true,
      order: oldest ? [['created_at', 'ASC']] : [['created_at', 'DESC']],
    });

    return {
      activities: data.rows,
      pagination: {
        limit: Number(limit),
        page: Number(page),
        totalPages: Math.ceil(data.count / limit),
        count: data.count,
      },
    };
  }

  /**
   * TODO possible security issue
   */
  async getOne(id: string) {
    const where = this.getWhere();
    where.deleted_on = null;
    where.id = id;

    const data = await Activities.findOne({
      where,
      attributes: {
        include: [
          [
            Sequelize.literal(
              `"ActivitiesModel"."start_date" at Time zone 'UTC'`
            ),
            'start_date',
          ],
        ],
      },
      include: ['feed'],
    });

    return data;
  }

  async updateActivity(data: any) {
    const { feedId, ...dataInfo } = data || {};

    const feed = await Feed.findOne({
      where: {
        id: feedId,
      },
    });

    const objectData = feed?.object_data || {};

    if (Object.keys(objectData).length) {
      await Feed.update(
        {
          object_data: { ...objectData, ...dataInfo },
        },
        {
          where: {
            id: feed?.id,
          },
        }
      );
    }

    return await Activities.update(
      {
        ...data,
        modified_user_id: this.user.id,
      },
      {
        where: {
          feed_id: feed?.id,
        },
      }
    );
  }

  async deleteByFeedId(feedId: string, opts: SequelizeOpts = {}) {
    /**
     * forgive me... this whole function feels off....
     * need to refactor entire feed and use proper relationships
     */
    const feed = await Feed.findOne({
      where: {
        id: feedId,
      },
    });
    if (!feed) {
      return;
    }

    const activities = await this.findAllByFeedId(feed.id);

    await Promise.all(
      activities.map((activity) =>
        // this is because front end is relying on feed logs instead of the
        // actual activity entity..... this needs to be revisited
        this.updateActivityFeed(feed, activity.id, {
          deleted_on: new Date(),
        })
      )
    );
  }
}

export function activityServiceFactory(user: AuthUser) {
  return new ActivityService(Activities, user);
}
