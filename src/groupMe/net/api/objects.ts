export interface IMessage {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string;
  group_id: string;
  created_at: number;
  text: string;
  system: boolean;
  attachments: IAttachment[];
}

export interface IAttachment {
  type: string;
  url: string | undefined;
  placeholder: string | undefined;
  charmap: number[][] | undefined;
  name: string | undefined;
  lng: string | undefined;
  lat: string | undefined;
  token: string | undefined;
  id: string | undefined;
  file_id: string | undefined;
  reply_id: string | undefined;
  user_ids: string[] | undefined;
  loci: number[][] | undefined;
}

export interface IGroup {
  id: string;
  name: string;
  messages: {
    last_message_id: string;
  };
}
