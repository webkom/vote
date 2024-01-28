<script lang="ts">
  import {
    ElectionSystems,
    type PopulatedElection,
  } from '$backend/types/types';
  import { onDestroy, onMount } from 'svelte';
  import { ResponseResult } from '$lib/utils/callApi';
  import { page } from '$app/stores';
  import adminApi from '$lib/utils/adminApi';
  import { alerts } from '$lib/stores';
  import userApi from '$lib/utils/userApi';
  import { goto } from '$app/navigation';
  import type { EventHandler } from 'svelte/elements';
  import type { ElectionResult } from '$backend/algorithms/types';
  import { Action } from '$backend/algorithms/stv';

  let election: PopulatedElection & Partial<ElectionResult> = null;
  let votedUsers: number = null;
  let activeUsers: number = null;

  let showResult = false;

  let form: HTMLFormElement;
  let newAlternativeDescription = '';

  let copySuccess = false;

  const countVotedUsers = async () => {
    const res = await adminApi.countVotedUsers($page.params.id);

    if (res.result === ResponseResult.SUCCESS) {
      votedUsers = res.body.users;
    } else {
      alerts.push(res.body.message, 'ERROR');
    }
  };

  const countActiveUsers = async () => {
    const res = await userApi.countActiveUsers();

    if (res.result === ResponseResult.SUCCESS) {
      activeUsers = res.body.users;
    } else {
      alerts.push(res.body.message, 'ERROR');
    }
  };

  function clearResults() {
    showResult = false;
    election.result = undefined;
    election.log = [];
  }

  const toggleElection = async () => {
    await clearResults();
    if (election.active) {
      const res = await adminApi.deactivateElection($page.params.id);
      if (res.result === ResponseResult.SUCCESS) {
        election.active = res.body.active;
        alerts.push('Avstemning er deaktivert!', 'WARNING');
      } else {
        alerts.push(res.body.message, 'ERROR');
      }
    } else {
      const res = await adminApi.activateElection($page.params.id);
      if (res.result === ResponseResult.SUCCESS) {
        election.active = res.body.active;
        alerts.push('Avstemning er aktivert', 'SUCCESS');
      } else {
        alerts.push(res.body.message, 'ERROR');
      }
    }
  };

  const toggleResult = async () => {
    showResult = !showResult;
    if (showResult) {
      const res = await adminApi.elect($page.params.id);

      if (res.result === ResponseResult.SUCCESS) {
        election = {
          ...election,
          ...res.body,
        };
      }
    } else {
      await clearResults();
    }
  };

  const handleAddAlternative: EventHandler<
    SubmitEvent,
    HTMLFormElement
  > = async (e) => {
    e.preventDefault();

    const res = await adminApi.addAlternative($page.params.id, {
      description: newAlternativeDescription,
    });

    if (res.result === ResponseResult.SUCCESS) {
      election.alternatives = [...election.alternatives, res.body];
      newAlternativeDescription = '';
      alerts.push('Alternativ lagret', 'SUCCESS');
    } else {
      alerts.push(res.body.message, 'ERROR');
    }
  };

  const copyElection = async () => {
    const alternatives = election.alternatives.map((alternative) => {
      return { description: alternative.description };
    });

    let electionCopy = {
      title: election.title,
      description: election.description,
      alternatives: alternatives,
      useStrict: election.useStrict,
      seats: election.seats,
      physical: election.physical,
      type: election.type,
    };

    goto('/admin/create_election?election=' + JSON.stringify(electionCopy));
  };

  const copyElectionCodeToClipboard = async () => {
    navigator.clipboard.writeText(election.accessCode.toString());
    copySuccess = true;
    setTimeout(() => {
      copySuccess = false;
    }, 1000);
  };

  let counterInterval: NodeJS.Timer;
  onMount(async () => {
    const res = await adminApi.getElection($page.params.id);
    if (res.result === ResponseResult.SUCCESS) {
      election = res.body;
    } else {
      alerts.push(res.body.message, 'ERROR');
    }
    countVotedUsers();
    countActiveUsers();

    counterInterval = setInterval(() => {
      countVotedUsers();
      countActiveUsers();
    }, 3000);
  });

  onDestroy(() => {
    clearInterval(counterInterval);
  });
</script>

{#if election}
  <div class="center text-center">
    <div class="election-info admin">
      <h2>{election.title}</h2>
      <p>{election.description}</p>
    </div>
    <div class="election-info admin">
      <h3 class="user-status">
        {votedUsers !== null ? votedUsers : '-'}/{activeUsers !== null
          ? activeUsers
          : '-'}
        <i class="fa fa-users" />
      </h3>
      <button
        class="toggle-election btn btn-outline-secondary"
        on:click={toggleElection}
      >
        {election.active ? 'Deaktiver' : 'Aktiver'}
      </button>
      {#if !election.physical}
        <h3 class="access-code-wrapper">
          Tilgangskode:<span class="access-code mono">
            {election.accessCode}
          </span>
          <i
            class="fa fa-copy copy-icon cs-tooltip"
            on:click={copyElectionCodeToClipboard}
            on:keypress={copyElectionCodeToClipboard}
          >
            <div class="cs-tooltiptext">
              {copySuccess ? 'Kopiert!' : 'Kopier'}
            </div>
          </i>
        </h3>
      {/if}
      <br />
      <span>
        <div class="tag cs-tooltip">
          {election.physical ? 'FYSISK' : 'DIGITALT'}
          <span class="cs-tooltiptext">
            {election.physical
              ? 'Krever aktivt kort for å stemme'
              : 'Krever tilgangskode for å stemme'}
          </span>
        </div>
        <div class="tag cs-tooltip" title="Tooltip on top">
          {election.type === 'normal' ? 'VANLIG VALG' : 'PREFERANSEVALG'}
          <span class="cs-tooltiptext"> Vanlig valg / Preferansevalg </span>
        </div>
        <div class="tag cs-tooltip">
          {election.useStrict ? 'KVALIFISERT FLERTALL' : 'ALMINNELIG FLERTALL'}
          <span class="cs-tooltiptext">
            Kvalifisert flertall (66.67%) / Alminnelig flertall (50%)
          </span>
        </div>
      </span>
    </div>
    <div class="alternatives admin mt-4">
      <h3>Alternativer</h3>
      <ul class="list-unstyled" data-testid="alternatives">
        {#each election.alternatives as alternative}
          <li>
            <div class="content">
              <p>{alternative.description}</p>
            </div>
          </li>
        {/each}
      </ul>
      {#if !election.active}
        <form
          bind:this={form}
          class="add-alternative form-group"
          name="alternativeForm"
          on:submit|preventDefault={handleAddAlternative}
        >
          <input
            class="form-control"
            id="new-alternative"
            type="text"
            name="alternative"
            placeholder="Skriv inn alternativ"
            required
            bind:value={newAlternativeDescription}
          />
          <button
            class="add-alternative btn btn-outline-secondary"
            type="submit"
            value="Submit"
            disabled={newAlternativeDescription.length === 0}
          >
            Legg til alternativ
          </button>
          <button
            class="toggle-show btn btn-outline-secondary"
            type="button"
            on:click={copyElection}>Kopier avstemning</button
          >
          <br />
          <button
            class="toggle-show btn btn-outline-secondary"
            type="button"
            on:click={toggleResult}
            class:alone={election.active}
          >
            {showResult ? 'Fjern resultat' : 'Kalkuler resultat'}
          </button>
        </form>
      {/if}
    </div>
    {#if showResult}
      <div>
        <h2>Oppsummering</h2>
        <table class="table mono">
          <tbody>
            <tr>
              <th class="th-left">Stemmer</th>
              <th class="th-right">
                =
                <span>
                  {election.voteCount}
                </span>
              </th>
            </tr>
            <tr>
              <th class="th-left">∟ Hvorav blanke stemmer</th>
              <th class="th-right">
                =
                <span>{election.blankVoteCount}</span></th
              >
            </tr>
            <tr>
              <th class="th-left">Plasser</th>
              <th class="th-right">
                =
                <span>{election.seats}</span></th
              >
            </tr>
            <tr>
              <th class="th-left">Terskel</th>
              {#if election.useStrict}
                <th class="th-right">
                  ⌊
                  <span class="cs-tooltip">
                    {election.voteCount}*2/3
                    <span class="cs-tooltiptext">2/3 av antall stemmer</span>
                  </span>
                  <span>⌋ + 1 = {election.thr}</span>
                </th>
              {:else}
                <th class="th-right"
                  >⌊
                  <span class="cs-tooltip">
                    {election.voteCount}
                    <span class="cs-tooltiptext">Antall stemmer</span>
                  </span>
                  <span>/</span>
                  <span class="cs-tooltip"
                    >{election.seats + 1}<span class="cs-tooltiptext"
                      >Antall plasser + 1</span
                    >
                  </span>
                  <span>⌋ + 1 = {election.thr}</span>
                </th>
              {/if}
            </tr>
          </tbody>
        </table>
        <h2>Logg</h2>
        {#if election.type === ElectionSystems.STV}
          <div>
            <ul class="list-unstyled log mono">
              {#each election.log ?? [] as elem}
                <li>
                  {#if elem.action === Action.iteration}
                    <div>
                      <h5>{elem.action} {elem.iteration}</h5>
                      {#each Object.keys(elem.counts) as key}
                        <p>
                          {key} with {elem.counts[key]} votes
                        </p>
                      {/each}
                    </div>
                  {/if}

                  {#if elem.action === Action.win}
                    <div>
                      <h5>{elem.action}</h5>
                      <p>
                        Elected: {elem.alternative.description} with {elem.voteCount}
                        votes
                      </p>
                    </div>
                  {/if}
                  {#if elem.action === Action.eliminate}
                    <div>
                      <h5>{elem.action}</h5>
                      <p>
                        Eliminated: {elem.alternative.description} with {elem.minScore}
                        votes
                      </p>
                    </div>
                  {/if}
                  {#if elem.action === Action.multi_tie_eliminations}
                    <div>
                      <h5>{elem.action}</h5>
                      {#each elem.alternatives ?? [] as alt}
                        <p>
                          Eliminated: {alt.description} with {elem.minScore} votes
                        </p>
                      {/each}
                    </div>
                  {/if}
                  {#if elem.action === Action.tie}
                    <div>
                      <h5>{elem.action}</h5>
                      <p>{elem.description}</p>
                    </div>
                  {/if}
                </li>
              {/each}
            </ul>
          </div>
        {:else if election.type === ElectionSystems.NORMAL}
          <div>
            <table class="table mono">
              <tbody>
                {#each Object.keys(election.log ?? {}) as key}
                  <tr>
                    <th class="th-left">{key}</th>
                    <th class="th-right">{election.log[key]}</th>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
        <hr />
        <h2>Resultat</h2>
        <div
          class:alert-success={election.result?.status == 'RESOLVED'}
          class:alert-warning={election.result?.status != 'RESOLVED'}
        >
          {election.result?.status}
        </div>
        <table class="table mono large" style="margin-bottom: 100px;">
          <tbody>
            {#each election.result?.winners ?? [] as winner}
              <tr>
                <th class="th-right">Vinner:</th>
                <th class="th-left">{winner.description}</th>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
{/if}

<style lang="scss">
  @import '../../../../../variables.scss';

  .cs-tooltip {
    position: relative;
    display: inline-block;
    border-bottom: 1px dotted #000;
  }
  .cs-tooltip .cs-tooltiptext {
    visibility: hidden;
    width: 120px;
    bottom: 130%;
    left: 50%;
    margin-left: -60px;
    background-color: #000;
    color: #fff;
    text-align: center;
    padding: 5px 0;
    border-radius: 6px;
    position: absolute;
    z-index: 1;
  }
  .cs-tooltip .cs-tooltiptext::after {
    content: ' ';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #000 transparent transparent transparent;
  }
  .cs-tooltip:hover .cs-tooltiptext {
    visibility: visible;
  }

  .tag {
    display: inline;
    background-color: #ddd;
    color: #394b59;
    padding: 4px 12px;
    margin: 5px;
    border-radius: 4px;
    font-size: 17px;
    font-weight: 700;
  }

  ul li {
    margin-bottom: 10px;
    height: 60px;
    border-radius: 2px;
    background-color: rgba($alternative-background, 0.15);
    display: flex;
    justify-content: space-between;
    margin-left: auto;
    transition: all 0.3s ease-in-out;

    .content {
      line-height: 60px;
      text-align: center;
      flex-grow: 1;

      p {
        color: darken($font-gray, 20%);
        opacity: 1;
        margin: 0;
        text-transform: uppercase;
        font-weight: 200;
        transition: color 0.3s;
        vertical-align: middle;
        display: inline-block;
        line-height: 24px;
      }
    }
  }

  .mono {
    font-family: 'Cutive Mono', monospace;
    font-size: 16px;
  }

  .access-code {
    font-weight: 800;
    font-size: 30px;
    padding-left: 10px;
  }

  .th-left {
    text-align: left;
    width: 50%;
  }
  .th-right {
    text-align: right;
    width: 50%;
  }

  .log {
    li {
      height: initial;
      margin-bottom: 10px;
      border-radius: 2px;
      border: 1px solid transparent;
      background-color: #0000801a;

      div {
        width: 100%;

        p {
          margin: 0;
          font-size: 16px;
          line-height: 20px;
        }

        h5 {
          margin: 5px;
          text-decoration: underline;
          font-weight: 1000;
        }
      }
    }
  }
</style>
