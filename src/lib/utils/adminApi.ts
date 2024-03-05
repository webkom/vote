import callApi from './callApi';
import type {
  AlternativeType,
  CreateElectionType,
  ElectionType,
  PopulatedElection,
} from '$backend/types/types';
import type { ElectionResult } from '$backend/algorithms/types';

export const createElection = (election: CreateElectionType) => {
  return callApi<ElectionType, CreateElectionType>(
    '/election/',
    'POST',
    election
  );
};

export const addAlternative = (id: string, alternative: AlternativeType) => {
  return callApi<AlternativeType, AlternativeType>(
    `/election/${id}/alternatives`,
    'POST',
    alternative
  );
};

export const activateElection = (id: string) => {
  return callApi<{ active: boolean }>(`/election/${id}/activate`, 'POST');
};

export const deactivateElection = (id: string) => {
  return callApi<{ active: boolean }>(`/election/${id}/deactivate`, 'POST');
};

export const elect = (id: string) => {
  return callApi<ElectionResult>(`/election/${id}/votes`);
};

export const getElections = () => {
  return callApi<ElectionType[]>('/election');
};

export const getElection = (id: string) => {
  return callApi<PopulatedElection>(`/election/${id}`);
};

export const countVotedUsers = (id: string) => {
  return callApi<{ users: number }>(`/election/${id}/count`);
};

const adminApi = {
  createElection,
  addAlternative,
  activateElection,
  deactivateElection,
  elect,
  getElections,
  getElection,
  countVotedUsers,
};

export default adminApi;
