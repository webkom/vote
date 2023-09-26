<script lang="ts">
  import { alerts } from '$lib/stores';
  import userApi from '$lib/utils/userApi';
  import deactivate from '$lib/assets/deactivate.mp3';
  import { onMount } from 'svelte';
  import { ResponseResult } from '$lib/utils/callApi';

  let deactivateAudio: HTMLAudioElement;

  onMount(() => {
    deactivateAudio = new Audio(deactivate);
  });

  const deactivateNonAdminUsers = async () => {
    const res = await userApi.deactivateNonAdminUsers();

    if (res.result === ResponseResult.SUCCESS) {
      deactivateAudio.play();
      alerts.push('Alle brukere ble deaktivert!', 'SUCCESS');
    } else {
      alerts.push('Noe gikk galt!', 'ERROR');
    }
  };
</script>

<div class="center text-center">
  <h3>Deaktivere alle brukere slik at all alle må reaktivere sin bruker.</h3>
  <ol>
    <li><h6>Fysisk: Scanne seg inn i lokale med adgangskort</h6></li>
    <li><h6>Digitalt: Skrive inn kode ved neste valg</h6></li>
  </ol>
  <button
    data-testid="deactivate"
    class="btn btn-outline-secondary"
    on:click={deactivateNonAdminUsers}>Deaktiver brukere</button
  >
</div>
