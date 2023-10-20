import { Direction, FileDownloadRequest, UserTransfers } from '../types/transfers';
import api from './api';


export const getAll = async ({ direction }: { direction: Direction }): Promise<UserTransfers[] | undefined> => {
  const response = (await api.get<UserTransfers[]>(`/transfers/${encodeURIComponent(direction)}s`)).data;

  if (!Array.isArray(response)) {
    console.warn('got non-array response from transfers API', response);
    return undefined;
  }

  return response as UserTransfers[];
};

export const download = ({ username, files = [] }: FileDownloadRequest) => {
  return api.post(`/transfers/downloads/${encodeURIComponent(username)}`, files);
};

export const cancel = (direction: Direction, username: string, id: string, remove = false) => {
  return api.delete(
    `/transfers/${direction}s/${encodeURIComponent(username)}/${encodeURIComponent(id)}?remove=${remove}`);
};

export const clearCompleted = (direction: Direction) => {
  return api.delete(`/transfers/${direction}s/all/completed`);
};

// 'Requested'
// 'Queued, Remotely'
// 'Queued, Locally'
// 'Initializing'
// 'InProgress'
// 'Completed, Succeeded'
// 'Completed, Cancelled'
// 'Completed, TimedOut'
// 'Completed, Errored'
// 'Completed, Rejected'

export const getPlaceInQueue = (username: string, id: string) => {
  return api.get(`/transfers/downloads/${encodeURIComponent(username)}/${encodeURIComponent(id)}/position`);
};

export const isStateRetryable = (state: string) =>
  state.includes('Completed') && state !== 'Completed, Succeeded';

export const isStateCancellable = (state: string) =>
  ['InProgress', 'Requested', 'Queued', 'Queued, Remotely', 'Queued, Locally', 'Initializing'].find(s => s === state);

export const isStateRemovable = (state: string) => state.includes('Completed');
