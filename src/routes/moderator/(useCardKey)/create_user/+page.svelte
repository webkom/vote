<script lang="ts">
  import { alerts } from '$lib/stores';
  import { cardKeyScanStore } from '$lib/utils/cardKeyScanStore';
  import userApi from '$lib/utils/userApi';
  import type { EventHandler } from 'svelte/elements';

  let form: HTMLFormElement;

  let username: string = '';
  let password: string = '';
  let confirmPassword: string = '';

  $: usernameMinLength = username.length >= 5;
  $: usernamePattern = username.match(/^[a-zA-Z0-9]+$/);
  $: passwordMinLength = password.length >= 6;
  $: passwordMatch = password === confirmPassword;

  $: disableSubmit =
    !usernameMinLength ||
    !usernamePattern ||
    !passwordMinLength ||
    !passwordMatch ||
    !$cardKeyScanStore.cardKey;

  const handleCreateUser: EventHandler<SubmitEvent, HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();
    const res = await userApi.createUser({
      ...Object.fromEntries(new FormData(e.currentTarget)),
      cardKey: $cardKeyScanStore.cardKey,
    });

    if (res.result === 'success') {
      alerts.push('Bruker registrert!', 'SUCCESS');
      form.reset();
    } else {
      switch (res.body.name) {
        case 'DuplicateUsernameError':
          alerts.push('Dette brukernavnet er allerede i bruk.', 'ERROR');
          break;
        case 'DuplicateCardError':
          alerts.push('Dette kortet er allerede blitt registrert.', 'ERROR');
          break;
        default:
          alerts.push('Noe gikk galt!', 'ERROR');
      }
    }
  };
</script>

<div class="center text-center">
  <form
    class="form-group"
    name="createUserForm"
    on:submit|preventDefault={handleCreateUser}
    bind:this={form}
  >
    <div class="form-group">
      <label for="cardKey">Kortnummer</label><input
        class="form-control"
        type="text"
        name="cardKey"
        placeholder="Scan kort"
        value={$cardKeyScanStore.cardKey}
        required
        disabled
      />
    </div>
    {#if !$cardKeyScanStore.cardKey}
      <p class="text-danger">Kortnummer er påkrevd</p>
    {/if}
    <div class="form-group">
      <label for="username">Brukernavn</label><input
        class="form-control"
        type="text"
        id="username"
        name="username"
        bind:value={username}
        placeholder="Skriv inn brukernavn"
      />
      {#if !usernameMinLength}
        <p class="text-danger">Brukernavn må være minst 5 tegn</p>
      {/if}
      {#if !usernamePattern}
        <p class="text-danger">
          Brukernavn kan bare inneholde tall eller bokstaver fra A-Z
        </p>
      {/if}
    </div>
    <div class="form-group">
      <label for="password">Passord</label><input
        class="form-control"
        type="password"
        id="password"
        name="password"
        bind:value={password}
        placeholder="Skriv inn ønsket passord"
      />
      {#if !passwordMinLength}
        <p class="text-danger">Passord må være minst 6 tegn</p>
      {/if}
    </div>
    <div class="form-group">
      <label for="confirmPassword">Bekreft passord</label><input
        class="form-control"
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        bind:value={confirmPassword}
        placeholder="Bekreft passord"
      />
      {#if !passwordMatch}
        <p class="text-danger">Må være lik passordet</p>
      {/if}
    </div>
    <button
      class="btn btn-outline-secondary"
      id="submit"
      type="submit"
      disabled={disableSubmit}>Lag ny bruker</button
    >
  </form>
</div>
