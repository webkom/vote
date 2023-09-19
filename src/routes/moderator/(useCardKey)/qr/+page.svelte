<script lang="ts">
  import { page } from '$app/stores';
  import cryptoRandomString from 'crypto-random-string';
  import { onDestroy, onMount } from 'svelte';
  import userApi from '$lib/utils/userApi';
  import { alerts } from '$lib/stores';
  import { goto } from '$app/navigation';

  import { cardKeyScanStore } from '$lib/utils/cardKeyScanStore';
  import { ResponseResult } from '$lib/utils/callApi';

  onMount(() => {
    const register = $page.url.searchParams.get('status');

    if (register === ResponseResult.SUCCESS)
      alerts.push('Bruker har blitt registrert.', 'SUCCESS');
    else if (register === 'fail')
      alerts.push(
        'Bruker har blitt laget og deaktivert. Du må derfor bruke et nytt kort',
        'WARNING'
      );
  });

  let firstCall = true;
  const unsubscribe = cardKeyScanStore.subscribe(async ({ cardKey }) => {
    if (firstCall || !cardKey) return (firstCall = false);
    const cardKeyString = cardKey.toString();

    const username = cryptoRandomString({ length: 10 });
    const password = cryptoRandomString({ length: 10 });
    const code = cryptoRandomString({ length: 10 });

    const res = await userApi.createUser({
      username,
      password,
      code,
      cardKey: cardKeyString,
    });

    if (res.result === ResponseResult.SUCCESS) {
      goto(
        `/moderator/showqr/?token=${username}:${password}:${code}&cardKey=${cardKeyString}`
      );
    } else {
      const errorCode = res.body.name;
      switch (errorCode) {
        case 'DuplicateUsernameError':
          alerts.push('Dette brukernavnet er allerede i bruk.', 'ERROR');
          break;

        case 'DuplicateCardError':
          alerts.push('Dette kortet er allerede blitt registrert.', 'ERROR');

          break;
        default:
          alerts.push('Noe gikk galt!', 'ERROR');
          break;
      }
    }
  });

  onDestroy(() => {
    alerts.removeAll();
    unsubscribe();
  });
</script>

<div class="center text-center px-2">
  <form class="form-group" name="createQRForm">
    <div class="form-group">
      <label for="cardKey">Kortnummer</label>
      <input
        class="form-control"
        type="text"
        name="cardKey"
        placeholder="Scan kort"
        value={$cardKeyScanStore.cardKey?.toString() ?? ''}
        required
        disabled
      />
    </div>
  </form>
</div>
