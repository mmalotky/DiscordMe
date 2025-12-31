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
  url: string;
  placeholder: string;
  charmap: number[][];
  name: string;
  lng: string;
  lat: string;
  token: string;
  id: string;
  file_id: string;
  reply_id: string;
  user_ids: string[];
  loci: number[][];
}

export interface IGroup {
  id: string;
  name: string;
  messages: {
    last_message_id: string;
  };
}
