<script lang="ts">
  import { alerts } from '$lib/stores';
  import userApi from '$lib/utils/userApi';
  import type { EventHandler } from 'svelte/elements';

  let pending = false;
  let form: HTMLFormElement;
  const handleGenerateUser: EventHandler<SubmitEvent, HTMLFormElement> = async (
    e
  ) => {
    pending = true;

    const res = await userApi.generateUser(
      Object.fromEntries(new FormData(e.currentTarget))
    );

    if (res.result === 'success') {
      alerts.push(`Bruker ${res.body.user} ble ${res.body.status}!`, 'SUCCESS');
      form.reset();
    } else {
      switch (res.status) {
        case 409:
          alerts.push(
            'Denne idenfikatoren har allerede fått en bruker.',
            'ERROR'
          );
          break;
        default:
          alerts.push('Noe gikk galt!', 'ERROR');
      }
    }
    pending = false;
  };
</script>

<div class="center text-center">
  <form
    class="form-group"
    name="generateUserForm"
    on:submit|preventDefault={handleGenerateUser}
    bind:this={form}
  >
    <div class="form-group">
      <label for="identifier">Identifikator</label>
      <input
        required
        class="form-control"
        type="text"
        id="identifier"
        name="identifier"
        placeholder="Skriv inn identifikator"
      />
    </div>
    <div class="form-group">
      <label for="email">Epost</label>
      <input
        required
        class="form-control"
        type="text"
        id="email"
        name="email"
        placeholder="Skriv inn epost"
      />
    </div>
    <button
      class="btn btn-outline-secondary"
      id="submit"
      type="submit"
      disabled={pending}>Generer bruker</button
    >
  </form>
</div>
