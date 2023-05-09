import { io } from 'socket.io-client';

const socketIOService = <Response>(
  message: string,
  callback: (res: Response) => void
) => {
  const socket = io();

  socket.on(message, callback);
};

export default socketIOService;
