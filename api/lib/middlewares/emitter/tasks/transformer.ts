import { EventReq, EventTask, GenericTextResource } from '../types';
import { extractMentions } from './utils';

export async function generateUsersMentionedFromComment(
  req: EventReq,
  event: EventTask<'COMMENT_CREATED' | 'COMMENT_UPDATED'>
) {
  return generateUsersMentioned(req, event, {
    action: event.event === 'COMMENT_CREATED' ? 'create' : 'update',
    id: event.payload.id.toString(),
    idType: 'number',
    type: 'comment',
    created_at: event.payload.date,
  });
}

export async function generateUsersMentionedFromNote(
  req: EventReq,
  event: EventTask<'NOTE_CREATED' | 'NOTE_UPDATED'>
) {
  return generateUsersMentioned(req, event, {
    action: event.event === 'NOTE_CREATED' ? 'create' : 'update',
    id: event.payload.id,
    idType: 'string',
    type: 'note',
    created_at: event.payload.date,
  });
}

async function generateUsersMentioned(
  req: EventReq,
  {
    resource,
    payload,
  }: EventTask<
    'COMMENT_CREATED' | 'COMMENT_UPDATED' | 'NOTE_CREATED' | 'NOTE_UPDATED'
  >,
  textResource: Omit<GenericTextResource, 'text'>
) {
  // TODO clean this up...
  let mentions;
  if ('previous_text' in payload) {
    mentions = extractMentions(payload.text, payload.previous_text);
  } else {
    mentions = extractMentions(payload.text);
  }

  // nothing to do
  if (mentions.length === 0) {
    return;
  }

  // need to exclude current user from mention
  const cleanMentions = mentions.filter((mention) => mention !== req.user.id);

  await req.emitter.emitAppEvent(
    req.user,
    {
      event: 'USERS_MENTIONED',
      resource: {
        id: resource.id,
        type: resource.type,
      },
      payload: {
        mentions: cleanMentions,
        textResource: {
          ...textResource,
          text: payload.text.blocks.reduce(
            (acc, block) => `${acc} ${block.text}`,
            ''
          ),
        },
      },
    },
    req.otel
  );
}
