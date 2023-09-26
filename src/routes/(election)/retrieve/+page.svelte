<script lang="ts">
  import {
    ElectionSystems,
    type IAlternative,
    type PopulatedElection,
  } from '$backend/types/types';
  import callApi, { ResponseResult } from '$lib/utils/callApi';
  import { onMount } from 'svelte';
  import type { EventHandler } from 'svelte/elements';

  let vote: {
    priorities: IAlternative[];
    election: PopulatedElection;
  };

  let voteHash: string;
  $: invalidVoteHash = voteHash !== undefined && voteHash.length === 0;

  const handleRetrieveVote: EventHandler<SubmitEvent, HTMLFormElement> = async (
    e
  ) => {
    const res = await callApi<typeof vote>('/vote', 'GET', null, {
      'Vote-Hash': voteHash,
    });
    if (res.result === ResponseResult.SUCCESS) {
      vote = res.body;
    }
  };

  onMount(() => {
    voteHash = localStorage.getItem('voteHash') || '';
  });
</script>

<div class="center text-center">
  <form
    class="form-group vote-result-form"
    name="retrieveVoteForm"
    method="POST"
    on:submit|preventDefault={handleRetrieveVote}
  >
    <div class="form-group">
      <label for="voteHash">Skriv inn kvittering</label>
      <input
        class="form-control"
        type="text"
        name="voteHash"
        bind:value={voteHash}
        placeholder="Kvittering"
        required
      />
      {#if invalidVoteHash}
        <p class="text-danger">Kvittering er påkrevd</p>
      {/if}
    </div>
    <button
      class="btn btn-outline-secondary btn-lg"
      type="submit"
      disabled={invalidVoteHash}>Hent avstemning</button
    >
  </form>
  {#if vote}
    <div class="text-center vote-result-feedback">
      <h3>
        {vote.election.type === ElectionSystems.NORMAL
          ? 'Ditt valg'
          : 'Din prioritering'} på: {vote.election.title}
      </h3>
      <div class="confirmVotes">
        <div class="ballot">
          {#if vote.priorities.length === 0}
            <h3>Blank stemme</h3>
            <i
              >Din stemme vil fortsatt påvirke hvor mange stemmer som kreves for
              å vinne</i
            >
          {:else}
            <ol
              style:list-style-type={vote.election.type ===
              ElectionSystems.NORMAL
                ? 'circle'
                : 'decimal'}
              data-testid="confirmation"
            >
              {#each vote.priorities as alternative}
                <li class="confirm-pri">
                  <p>{alternative.description}</p>
                </li>
              {/each}
            </ol>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  @import '../../../variables.scss';

  .vote-result-form {
    margin: 0 auto;
  }
  .vote-result-form input {
    margin: 10px auto;
    text-align: center;
    width: 70%;
  }
  .vote-result-feedback {
    margin-top: 30px;
  }
  .vote-result-feedback p {
    font-size: 18px;
  }

  @media (max-width: 1000px) {
    .vote-result-form input {
      width: 100%;
    }
  }

  .ballot {
    border: 1px solid rgba($alternative-background, 0.3);
    background-color: rgba($alternative-background, 0.05);
    border-radius: 8px;

    ol {
      margin: 0;
      .confirm-pri {
        text-align: left;
        line-height: 40px;
      }

      p {
        text-transform: uppercase;
        vertical-align: middle;
        margin: 0;
      }
    }
  }
</style>
