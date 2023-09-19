<script lang="ts">
  import { alerts } from '$lib/stores';
  import { cardKeyScanStore } from '$lib/utils/cardKeyScanStore';
  import userApi from '$lib/utils/userApi';
  import { onDestroy, onMount } from 'svelte';
  import ding from '$lib/assets/ding.mp3';
  import error from '$lib/assets/error.mp3';
  import { ResponseResult } from '$lib/utils/callApi';

  let dingAudio: HTMLAudioElement;
  let errorAudio: HTMLAudioElement;

  onMount(() => {
    dingAudio = new Audio(ding);
    errorAudio = new Audio(error);
  });

  let firstCall = true;
  const unsubscribe = cardKeyScanStore.subscribe(async ({ cardKey }) => {
    if (firstCall || !cardKey) return (firstCall = false);
    const res = await userApi.toggleUser(cardKey);

    if (res.result === ResponseResult.SUCCESS) {
      const lastAlert = alerts.getLastAlert();

      if (dingAudio) dingAudio.play();

      if (res.body.active) {
        if (lastAlert && lastAlert.type !== 'SUCCESS') {
          alerts.removeAll();
        }
        alerts.push('Kort aktivert, GÅ INN', 'SUCCESS', true);
      } else {
        if (lastAlert && lastAlert.type !== 'WARNING') {
          alerts.removeAll();
        }
        alerts.push('Kort deaktivert, GÅ UT', 'WARNING', true);
      }
    } else {
      if (errorAudio) errorAudio.play();

      switch (res.body.name) {
        case 'NotFoundError':
          alerts.push(
            'Uregistrert kort, vennligst lag en bruker først.',
            'ERROR'
          );
          break;
        default:
          alerts.push('Noe gikk galt!', 'ERROR');
      }
    }
  });

  onDestroy(() => unsubscribe());
</script>

<div class="center text-center">
  <h2>Vennligst skann kortet ditt</h2>
</div>
