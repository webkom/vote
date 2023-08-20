<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import socketIOService from '$lib/socketIOService';
  import userApi from '$lib/utils/userApi';
  import QRCode from 'qrcode';
  import { onMount } from 'svelte';

  let qrdata: string = '';

  const token = $page.url.searchParams.get('token');
  const cardKey = $page.url.searchParams.get('cardKey');
  const [, , code] = token.split(':');

  const link = `${$page.url.origin}/auth/login/?token=${token}`;

  QRCode.toDataURL(
    link,
    { type: 'image/png', width: 1000 },
    function (err, url) {
      qrdata = url;
    }
  );

  onMount(() => {
    socketIOService('qr-opened', (socketCode) => {
      if (socketCode === code) {
        goto('/moderator/qr?status=success');
      }
    });
  });
</script>

<div class="row">
  <div class="text-center image-block">
    <h3>Scan QR-Kode!</h3>
    <img
      class="animated-qr"
      src={qrdata}
      alt="QR-kode"
      width="600"
      height="600"
    />
  </div>
  <div class="text-center">
    <button
      class="btn btn-default"
      on:click={() => {
        goto('/moderator/qr?status=success');
      }}>Lukk</button
    >
    <button
      class="btn btn-default"
      on:click={async () => {
        const res = await userApi.toggleUser(cardKey);
        if (res.status === 201) {
          goto('/moderator/qr?status=fail');
        } else {
          goto('/moderator/qr?status=success');
        }
      }}>Lukk og deaktiver bruker</button
    >
  </div>
</div>
