import short from 'short-uuid';
import { get, writable } from 'svelte/store';

const xsrf = writable('');

const createAlerts = () => {
  const alertList = writable([]);
  const { subscribe, set, update } = alertList;

  const FADE_DURATION = 500;
  const CLOSE_DELAY = 5000;

  const dismiss = (alertID: string) => {
    update((alerts) => alerts.filter((alert) => alert.id != alertID));
  };

  return {
    subscribe,
    push: (
      message: string,
      type: 'ERROR' | 'WARNING' | 'SUCCESS',
      fade = false
    ) =>
      update((alerts) => {
        const newAlert = {
          message,
          type,
          fade,
          id: short.generate(),
        };

        setTimeout(() => {
          dismiss(newAlert.id);
        }, CLOSE_DELAY);

        return [newAlert, ...alerts];
      }),
    dismiss,
    removeAll: () => {
      set([]);
    },
    getLastAlert: () => {
      return get(alertList).slice().pop();
    },
    FADE_DURATION,
    CLOSE_DELAY,
  };
};

const alerts = createAlerts();

export { xsrf, alerts };
