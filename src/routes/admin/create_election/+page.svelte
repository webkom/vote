<script lang="ts">
  import type { EventHandler } from 'svelte/elements';
  import short from 'short-uuid';
  import adminApi from '$lib/utils/adminApi';
  import activate from '$lib/assets/activate.mp3';
  import { ElectionSystems } from '$backend/types/types';
  import { ResponseResult } from '$lib/utils/callApi';
  import { alerts } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  type FormAlternative = { description: string; id: string };

  const existingElectionString = $page.url.searchParams.get('election');
  const existingElection = JSON.parse(existingElectionString);

  let title = existingElection?.title ?? null;
  let description = existingElection?.description ?? '';
  let seats = existingElection?.seats ?? 1;
  let useQualifiedMajority = existingElection?.useStrict ?? false;
  let electionSystem = existingElection?.type ?? ElectionSystems.NORMAL;
  let electionLocation = existingElection
    ? existingElection.electionSystem ?? 'physical'
    : 'physical';
  let alternatives: FormAlternative[] = existingElection?.alternatives.map(
    (a: FormAlternative) => ({
      ...a,
      id: short.uuid(),
    })
  ) ?? [{ description: '', id: short.uuid() }];

  $: missingTitle = title !== null && !(title.length > 0);
  $: seatsOutsideRange = seats < 1 || seats > alternatives.length;
  $: invalidForm =
    missingTitle ||
    seatsOutsideRange ||
    alternatives.some((a) => a.description.length === 0);

  let activateAudio: HTMLAudioElement;
  onMount(() => {
    activateAudio = new Audio(activate);
  });

  const handleCreateElection: EventHandler<
    SubmitEvent,
    HTMLFormElement
  > = async (e) => {
    e.preventDefault();
    const res = await adminApi.createElection({
      title,
      seats,
      physical: electionLocation === 'physical',
      useStrict: useQualifiedMajority,
      type: electionSystem,
      description,
      alternatives: alternatives.map<{ description: string }>(
        ({ description }) => ({
          description,
        })
      ),
    });

    if (res.result === ResponseResult.SUCCESS) {
      activateAudio.play();
      alerts.push('Avstemning laget!', 'SUCCESS');
      goto(`/admin/election/${res.body._id}/edit`);
    } else {
      alerts.push(res.body.message, 'ERROR');
    }
  };
</script>

<div class="center text-center">
  <form
    class="form-group"
    on:submit|preventDefault={handleCreateElection}
    name="createElectionForm"
  >
    <div class="form-group">
      <div class="btn-group">
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <label
          class="btn"
          class:selected={electionLocation === 'physical'}
          data-testid="physical-election-button"
          tabindex="0"
          on:keypress={(e) =>
            e.key === 'Enter' ? (electionLocation = 'physical') : null}
        >
          Fysisk valg
          <input type="radio" bind:group={electionLocation} value="physical" />
        </label>
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <label
          class="btn"
          class:selected={electionLocation === 'digital'}
          data-testid="digital-election-button"
          tabindex="0"
          on:keypress={(e) =>
            e.key === 'Enter' ? (electionLocation = 'digital') : null}
        >
          Digitalt valg
          <input type="radio" bind:group={electionLocation} value="digital" />
        </label>
      </div>
    </div>
    <div class="form-group">
      <label for="title">Tittel</label>
      <input
        class="form-control"
        type="text"
        name="title"
        id="title"
        placeholder="Skriv inn tittel"
        bind:value={title}
        on:blur={() => (title === null ? (title = '') : title)}
        required
      />
      {#if missingTitle}
        <p class="text-danger">Tittel er påkrevd</p>
      {/if}
    </div>
    <div class="form-group">
      <label for="description">Beskrivelse</label>
      <input
        class="form-control"
        type="text"
        name="description"
        id="description"
        placeholder="Skriv inn beskrivelse"
        bind:value={description}
      />
    </div>
    <div class="form-group">
      <h3>Type</h3>
      <div class="btn-group">
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <label
          class="btn"
          class:selected={electionSystem === ElectionSystems.NORMAL}
          data-testid="normal-system-button"
          tabindex="0"
          on:keypress={(e) =>
            e.key === 'Enter'
              ? (electionSystem = ElectionSystems.NORMAL)
              : null}
        >
          Normal
          <input
            type="radio"
            bind:group={electionSystem}
            value={ElectionSystems.NORMAL}
          />
        </label>
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <label
          class="btn"
          class:selected={electionSystem === ElectionSystems.STV}
          data-testid="stv-system-button"
          tabindex="0"
          on:keypress={(e) =>
            e.key === 'Enter' ? (electionSystem = ElectionSystems.STV) : null}
        >
          Preferansevalg
          <input
            type="radio"
            bind:group={electionSystem}
            value={ElectionSystems.STV}
          />
        </label>
      </div>
    </div>
    {#if electionSystem === ElectionSystems.STV}
      <div class="election-type">
        <div class="form-group">
          <label for="seats">Plasser</label>
          <input
            class="form-control"
            type="number"
            name="seats"
            placeholder="Antall plasser (vinnere)"
            required
            bind:value={seats}
            min="1"
            max={alternatives.length}
            disabled={useQualifiedMajority}
          />
          {#if seatsOutsideRange}
            <div>
              <p class="text-danger">
                Antall plasser er ikke gyldig<br />Må være minst 1 og maks {alternatives.length}
              </p>
              <p>Legg til flere alternativer for å øke antall plasser</p>
            </div>
          {/if}
          {#if useQualifiedMajority}
            <p>Deaktiver kvalifisert flertall for å endre antall plasser</p>
          {/if}
        </div>
      </div>
    {/if}
    <div class="form-group pt-3">
      <label>
        Bruk §0.3 kvalifisert flertall
        <input
          type="checkbox"
          name="useStrict"
          data-testid="qualified-majority"
          bind:checked={useQualifiedMajority}
          disabled={seats !== 1}
        />
      </label><br />
      <p>
        Krever 2/3 av stemmene for å vinne.
        {#if electionSystem === ElectionSystems.STV}
          <span>
            Ellers brukes vanlig STV regler. Gir ikke mening for plasser {'>'} 1
          </span>
        {/if}
      </p>
    </div>
    <div class="alternatives admin">
      <label for="none">
        Alternativer
        <span
          class="new-alternative"
          on:keypress={(e) =>
            e.key === 'Enter'
              ? (alternatives = [
                  ...alternatives,
                  { description: '', id: short.uuid() },
                ])
              : null}
          on:click={() =>
            (alternatives = [
              ...alternatives,
              { description: '', id: short.uuid() },
            ])}
        >
          <i class="fa fa-plus-square" />
        </span>
      </label>
      <ng-form name="alternativeForm" data-testid="alternatives">
        {#each alternatives as alternative (alternative.id)}
          <div class="form-group pt-2">
            <div class="input-group">
              <input
                class="form-control"
                type="text"
                placeholder="Skriv inn en beskrivelse"
                bind:value={alternative.description}
                required
              />
              {#if alternatives.length > 1}
                <div
                  class="input-group-addon"
                  on:click={() =>
                    (alternatives = alternatives.filter(
                      (a) => a.id !== alternative.id,
                      1
                    ))}
                  on:keypress={() =>
                    (alternatives = alternatives.filter(
                      (a) => a.id !== alternative.id,
                      1
                    ))}
                >
                  <span class="input-group-text">Slett</span>
                </div>
              {/if}
            </div>
            {#if alternative.description.length === 0}
              <div class="text-danger">Alternativ er påkrevd</div>
            {/if}
          </div>
        {/each}
      </ng-form>
    </div>
    <button
      class="btn btn-outline-secondary btn-lg mt-3"
      id="submit"
      type="submit"
      disabled={invalidForm}>Lag avstemning</button
    >
  </form>
</div>

<style lang="scss">
  @import '../../../variables.scss';

  form {
    button {
      margin-top: 10px;
    }

    i {
      margin-left: 10px;
      color: $abakus-light;

      &:hover {
        cursor: pointer;
        color: $abakus-dark;
      }
    }

    input[type='checkbox'] {
      transform: scale(1.5);
      margin-left: 10px;
    }

    input[type='radio'] {
      display: none;
    }
  }

  .election-type {
    border-left: 4px solid $abakus-dark;
    padding: 4px 10px;
  }

  label.btn {
    color: #fff;
    margin: 0;
    background-color: $abakus-dark;
    &:active {
      background-color: darken($abakus-dark, 20%);
    }
    &:hover {
      background-color: darken($abakus-dark, 20%);
    }
    &:focus {
      background-color: darken($abakus-dark, 20%);
    }
    &.selected {
      background-color: darken($abakus-dark, 20%);
    }
    &.active {
      background-color: darken($abakus-dark, 20%);
    }
  }

  .input-group-text {
    font-size: 18px;
    color: $abakus-light;
    &:hover {
      cursor: pointer;
      color: $abakus-dark;
    }
  }

  .alternatives.admin {
    ul li {
      &:hover {
        cursor: default;
        background-color: rgba($alternative-background, 0.15);
        box-shadow: none;
      }
    }
  }
</style>
