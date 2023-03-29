import { UserAttr } from 'lib/middlewares/sequelize';
import { NotificationService } from 'lib/services';

async function userHasSetting(userId: string, setting: string) {
  const settings = await NotificationService.getSettingsByUserId(userId);
  return !!settings?.settings?.[setting];
}

export const settingsValidator = async (userId: string, setting: string) => {
  const hasSetting = await userHasSetting(userId, setting);
  if (!hasSetting) {
    throw new Error('Settings not found');
  }
};

export const filterUsersBySetting = async (
  users: UserAttr[],
  setting: string
) => {
  const validUsers = await Promise.all(
    users.map(async (user) => {
      const hasSetting = await userHasSetting(user.id, setting);

      if (hasSetting) {
        return user;
      }
      return null;
    })
  );

  return validUsers.filter((user) => !!user) as UserAttr[];
};
