import callApi from './callApi';

export const toggleUser = (cardKey: number | string) => {
  return callApi<{ active: boolean }>(
    '/user/' + cardKey + '/toggle_active',
    'POST'
  );
};

export const createUser = (user: Record<string, unknown>) => {
  return callApi('/user', 'POST', user);
};

export const generateUser = (user: Record<string, unknown>) => {
  return callApi<{ status: string; user: string }>(
    '/user/generate',
    'POST',
    user
  );
};

export const changeCard = (user: Record<string, unknown>) => {
  return callApi('/user/' + user.username + '/change_card', 'PUT', user);
};

export const countActiveUsers = () => {
  return callApi<{ users: number }>('/user/count?active=true');
};

export const deactivateNonAdminUsers = () => {
  return callApi('/user/deactivate', 'POST');
};

const userApi = {
  toggleUser,
  createUser,
  generateUser,
  changeCard,
  countActiveUsers,
  deactivateNonAdminUsers,
};

export default userApi;
