<script lang="ts" type="module">
  import { page } from '$app/stores';
  import QrScanner from 'qr-scanner';
  import QRCode from 'qrcode';
  import { onMount } from 'svelte';
  import type { EventHandler } from 'svelte/elements';
  import callApi, { generateXSRFToken } from '$lib/utils/callApi';
  import { alerts } from '$lib/stores';

  let username: string = '';
  let password: string = '';
  let readonlyCredentials = false;

  let qrImgSrc: string;
  let camera: HTMLVideoElement;

  let hideScreenshotAlert = true;

  let feedbackMessage = {
    authfailed: 'Brukernavn og/eller passord er feil.',
    unknownError: 'Oisann! Noe gikk galt.',
  };

  let feedback = $page.url.searchParams.get('feedback') as
    | keyof typeof feedbackMessage
    | null;

  const handleLogin: EventHandler<SubmitEvent, HTMLFormElement> = async (e) => {
    e.preventDefault();
    const res = await callApi(
      '/auth/login',
      'POST',
      Object.fromEntries(new FormData(e.currentTarget))
    );

    if (res.status == 200) {
      window.location.assign('/');
    } else if (res.status == 401) {
      feedback = 'authfailed';
    } else {
      feedback = 'unknownError';
    }
  };

  const getTokenFromURL = (url: string) =>
    new URL(url).searchParams.get('token');

  const useTokenCredentials = async (token: string) => {
    try {
      const [u, p, code] = token.split(':');
      username = u;
      password = p;
      readonlyCredentials = true;

      // If the user gets token from mail the code will be ""
      if (code) {
        hideScreenshotAlert = false;
        fetch('/api/qr/open/?code=' + code);
        try {
          qrImgSrc = await QRCode.toDataURL($page.url.toString(), {
            type: 'image/png',
            width: 300,
          });
        } catch (err) {
          console.error(err);
        }
      }
    } catch (e) {
      alerts.push('Det skjedde en feil. Prøv på nytt', 'ERROR');
      console.warn('Unable to decode token: ', e);
    }
  };

  onMount(() => {
    generateXSRFToken();
    // Check if credentials is given by a token from url or qrcode
    const token = $page.url.searchParams.get('token');

    if (token) {
      useTokenCredentials(token);
    } else {
      QrScanner.hasCamera();

      const qrScanner = new QrScanner(
        camera,
        (result) => {
          try {
            useTokenCredentials(getTokenFromURL(result.data));
          } catch (e) {
            console.warn('Malformed qr-code: ', result);
          }
        },
        { returnDetailedScanResult: true } // Use new api
      );

      qrScanner.start();
    }
  });
</script>

<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-6 text-center">
      <video class="center" bind:this={camera} muted playsinline />
      <br />
      <form on:submit|preventDefault={handleLogin}>
        <label class="form-label" for="username">Brukernavn:</label>
        <div class="input-group mb-3">
          <input
            class="form-control"
            name="username"
            id="username"
            type="text"
            required
            style={`text-align: ${readonlyCredentials ? 'center' : 'initial'}`}
            readonly={readonlyCredentials}
            value={username}
          />
        </div>

        <label class="form-label" for="password">Passord:</label>
        <div class="input-group mb-3">
          <input
            class="form-control"
            name="password"
            id="password"
            type={readonlyCredentials ? 'text' : 'password'}
            required
            style={`text-align: ${readonlyCredentials ? 'center' : 'initial'}`}
            readonly={readonlyCredentials}
            value={password}
          />
        </div>
        {#if Object.keys(feedbackMessage).includes(feedback)}
          <p class="text-danger">{feedbackMessage[feedback]}</p>
        {/if}
        <div hidden={hideScreenshotAlert} id="alertInfo">
          {#if qrImgSrc}
            <img id="qrImg" width="50%" src={qrImgSrc} alt="QR code" />
          {/if}
          <div class="alert alert-danger">
            <p><b>Velkommen til VOTE</b></p>
            <p>
              Ta <b>screenshot</b> av denne siden for å lagre brukernavn og passord
            </p>
          </div>
        </div>
        <button
          class="btn btn-outline-secondary"
          type="submit"
          hidden={!hideScreenshotAlert}
          >Logg på
        </button>
      </form>
      <br />
      <div hidden={hideScreenshotAlert} id="confirmScreenshot">
        <button
          class="btn btn-outline-secondary"
          on:click={() => {
            hideScreenshotAlert = true;
          }}
          >Jeg har tatt screenshot
        </button>
      </div>
    </div>
  </div>
</div>

<style type="text/css">
  video {
    width: 100%;
  }
</style>
