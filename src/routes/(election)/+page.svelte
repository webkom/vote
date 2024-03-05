<script lang="ts">
  import STVAlternativesList from './STVAlternativesList.svelte';
  import {
    ElectionSystems,
    type IAlternative,
    type PopulatedElection,
  } from '$backend/types/types';
  import callApi, { ResponseResult } from '../../lib/utils/callApi';
  import ToggleList from './ToggleList.svelte';
  import { onMount } from 'svelte';
  import socketIOService from '$lib/socketIOService';
  import STVPriorityList from './STVPriorityList.svelte';
  import { alerts } from '$lib/stores';

  let electionExists: boolean = false;
  let errorCode: string = '';
  let confirmVote: boolean = false;
  let accessCode: string = '';

  let activeElection: PopulatedElection = null;

  let priorities: IAlternative[] = [];

  const getActiveElection = async (accessCode: string = '') => {
    const res = await callApi<PopulatedElection>(
      '/election/active?accessCode=' + accessCode
    );

    if (res.result === ResponseResult.SUCCESS) {
      priorities = [];
      electionExists = true;
      activeElection = res.body;
      errorCode = '';
    } else {
      errorCode = res.body.name;
      if (res.status === 404) {
        electionExists = false;
        activeElection = null;
        accessCode = '';
      } else if (res.status === 403) {
        electionExists = true;
        activeElection = null;
        accessCode = '';
      } else {
        alerts.push(res.body.message, 'ERROR');
      }
    }
  };

  const vote = async (
    election: PopulatedElection,
    priorities: IAlternative[]
  ) => {
    const res = await callApi<{ name: string; hash: string }>('/vote', 'POST', {
      election,
      priorities,
    });
    if (res.result === ResponseResult.SUCCESS) {
      activeElection = null;
      priorities = [];
      electionExists = false;
      confirmVote = false;
      accessCode = '';
      localStorage.setItem('voteHash', res.body.hash);
      alerts.push('Takk for din stemme!', 'SUCCESS');
      getActiveElection();
    } else {
      errorCode = res?.body?.name ?? undefined;

      switch (errorCode) {
        case 'InactiveElectionError':
          alerts.push(
            'Denne avstemningen ser ut til å være deaktivert, vennligst prøv igjen.',
            'ERROR'
          );
          break;
        case 'AlreadyVotedError':
          alerts.push('Du kan bare stemme en gang per avstemning!', 'ERROR');
          break;
        case 'InactiveUserError':
          alerts.push(
            'Brukeren din er deaktivert, vennligst henvend deg til skranken.',
            'ERROR'
          );
          break;
        default:
          alerts.push('Noe gikk galt, vennligst prøv igjen.', 'ERROR');
      }
    }
  };

  onMount(async () => {
    await getActiveElection();
    socketIOService('election', getActiveElection);
  });
</script>

<div class="center text-center" style="padding: 0px 30px;">
  {#if electionExists}
    {#if !errorCode}
      {#if !confirmVote}
        <div class="election-info">
          <h2>{activeElection.title}</h2>
          <p>{activeElection.description || ''}</p>
        </div>
        {#if activeElection.type === 'stv'}
          <!-- --------------------------------------------------------------------->
          <!-- STV election -->
          <!-- ----------------------------------------------------------------->
          <div class="alternatives">
            <STVAlternativesList
              bind:alternatives={activeElection.alternatives}
              bind:priorities
            />
          </div>
          <div class="alternatives">
            <h3>Din prioritering</h3>
            {#if priorities.length === 0}
              <p class="helptext">
                <em>Velg et alternativ fra listen</em>
              </p>
            {/if}
          </div>
          <STVPriorityList bind:priorities />
        {:else if activeElection.type === 'normal'}
          <!-- --------------------------------------------------------------------->
          <!-- NORMAL type election view -->
          <!-- --------------------------------------------------------------------->
          <div class="alternatives">
            <h3>Alternativer</h3>
          </div>
          <ToggleList
            bind:alternatives={activeElection.alternatives}
            bind:priorities
          />
        {/if}
        <!-- --------------------------------------------------------------------->
        <!-- Confirm/Reset Vote -->
        <!-- --------------------------------------------------------------------->
        <button
          class="btn btn-lg btn-outline-secondary"
          on:click={() => {
            confirmVote = true;
          }}
        >
          {priorities.length === 0 ? 'Stem blank' : 'Avgi stemme'}
        </button>
        <div />
        <button
          class="btn btn-sm btn-danger"
          on:click={() => window.location.assign('/')}
        >
          Reset
        </button>
      {:else}
        <h3>Bekreft din stemme</h3>
        <div class="confirmVotes">
          <div class="ballot">
            {#if priorities.length === 0}
              <h3>Blank stemme</h3>
              <i>
                Din stemme vil fortsatt påvirke hvor mange stemmer som kreves
                for å vinne
              </i>
            {:else}
              <ol
                style:list-style-type={activeElection.type ===
                ElectionSystems.NORMAL
                  ? 'circle'
                  : 'decimal'}
                data-testid="confirmation"
              >
                {#each priorities as alternative}
                  <li class="confirm-pri">
                    <p>{alternative.description}</p>
                  </li>
                {/each}
              </ol>
            {/if}
          </div>
        </div>
        <button
          class="btn btn-lg btn-danger"
          on:click={() => {
            confirmVote = false;
          }}
          >Avbryt
        </button>
        <button
          class="btn btn-lg btn-success"
          on:click={() => vote(activeElection, priorities)}
          >Bekreft
        </button>
      {/if}
    {:else if errorCode === 'AccessCodeError'}
      <div class="access-code">
        <form
          class="form-group enter-code-form"
          name="enterCodeForm"
          on:submit|preventDefault={() => {
            getActiveElection(accessCode);
          }}
        >
          <div class="form-group access-code">
            <label for="accessCode">Kode</label>
            <input
              required
              class="form-control"
              type="number"
              name="accessCode"
              bind:value={accessCode}
              placeholder="----"
            />
          </div>
          <button
            class="btn btn-lg btn-success"
            id="submit"
            type="submit"
            disabled={accessCode.toString().length !== 4}>Verifiser</button
          >
        </form>
      </div>
    {:else if errorCode === 'InactiveUserError'}
      <div>
        <h1>Din bruker er ikke aktivert.</h1>
        <p>Gå til kortleseren ved utgangen for å aktivere brukeren din.</p>
      </div>
    {/if}
  {:else}
    <div>
      <h2>Ingen aktive avstemninger.</h2>
      <p>
        Denne siden oppdateres automatisk når en ny avstemning er tilgjenglig.
      </p>
    </div>
  {/if}
</div>

<style lang="scss">
  @import '../../variables.scss';

  .election-info h2 {
    text-transform: uppercase;
  }

  .helptext {
    height: 70px;
  }

  .alternatives {
    margin-bottom: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(177, 181, 188, 0.3);
    h3 {
      margin-bottom: 25px;
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
