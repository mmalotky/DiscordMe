export type Parameters = {
  [key: string]: string;
};

export interface IRequest {
  endpoint: string;
  params: Parameters;
}

export interface IGroupIndexRequestParameters extends Parameters {
  page: string;
}

export interface IGroupIndexRequest extends IRequest {
  params: IGroupIndexRequestParameters;
}
