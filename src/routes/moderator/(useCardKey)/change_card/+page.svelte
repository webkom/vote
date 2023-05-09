<script lang="ts">
  import { alerts } from '$lib/stores';
  import { cardKeyScanStore } from '$lib/utils/cardKeyScanStore';
  import userApi from '$lib/utils/userApi';
  import type { EventHandler } from 'svelte/elements';

  let form: HTMLFormElement;
  const handleChangeCard: EventHandler<SubmitEvent, HTMLFormElement> = async (
    e
  ) => {
    const res = await userApi.changeCard({
      ...Object.fromEntries(new FormData(e.currentTarget)),
      cardKey: $cardKeyScanStore.cardKey,
    });

    if (res.result === 'success') {
      alerts.push('Det nye kortet er nå registert.', 'SUCCESS');
      form.reset();
    } else {
      switch (res.body.name) {
        case 'DuplicateCardError':
          alerts.push('Dette kortet er allerede blitt registrert.', 'ERROR');
          break;
        case 'InvalidRegistrationError':
          alerts.push('Ugyldig brukernavn og/eller passord.', 'ERROR');
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
    name="changeCardForm"
    on:submit|preventDefault={handleChangeCard}
    bind:this={form}
  >
    <div class="form-group">
      <label for="card-number">Nytt kortnummer</label><input
        class="form-control"
        type="text"
        name="cardKey"
        value={$cardKeyScanStore.cardKey || ''}
        placeholder="Vennligst skann kortet"
        required
        disabled
      />
    </div>
    <div class="form-group">
      <label for="username">Brukernavn</label><input
        class="form-control"
        type="text"
        name="username"
        id="username"
        required
        placeholder="Skriv inn brukernavn"
      />
    </div>
    <div class="form-group">
      <label for="password">Password</label><input
        class="form-control"
        type="password"
        name="password"
        id="password"
        required
        placeholder="Skriv inn passord"
      />
    </div>
    <button class="btn btn-outline-secondary" id="submit" type="submit"
      >Registrer nytt kort</button
    >
    {#if !$cardKeyScanStore.cardKey}
      <p class="text-danger">Kortnummer er påkrevd</p>
    {/if}
  </form>
</div>
