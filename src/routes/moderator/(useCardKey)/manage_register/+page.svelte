<script lang="ts">
  import type { RegisterType } from '$backend/types/types';
  import { alerts } from '$lib/stores';
  import callApi from '$lib/utils/callApi';
  import { onMount } from 'svelte';

  let registers: RegisterType[] = [];
  let searchText: string = '';

  const getRegisteredEntries = async () => {
    const res = await callApi<RegisterType[]>(`/register`);

    if (res.result === 'success') {
      registers = res.body;
    } else {
      alerts.push(res.body.message, 'ERROR');
    }
  };

  const deleteRegister = async (register: string) => {
    const res = await callApi<{ message: string }>(
      `/register/${register}`,
      'DELETE'
    );

    if (res.result === 'success') {
      alerts.push(res.body.message, 'SUCCESS');
      getRegisteredEntries();
    } else {
      alerts.push(res.body.message, 'ERROR');
    }
  };

  onMount(() => {
    getRegisteredEntries();
  });
</script>

<div class="row">
  <div class="text-center center">
    <h3>Genererte brukere</h3>
    <p>Tabellen under viser en oversikt over alle genererte brukere.</p>
    Brukere havner kun i denne oversikten hvis de er opprettet med "Generer bruker"
    fanen, eller direkte fra API'et. Brukere laget med "Registrer bruker" eller "QR"
    vil ikke vises under.
  </div>
</div>
<div class="center" style="margin-top: 50px">
  <hr />
  <div class="usage-flex">
    <h5 style="text-align:right; margin-bottom: 0">
      Totalt {registers.length} genererte brukere
    </h5>
    <label for="searchText"
      >Search:<input id="searchText" bind:value={searchText} /></label
    >
  </div>
  <table style="width:100%; margin-top: 30px">
    <thead style="border-bottom:2px solid black">
      <tr>
        <th>Identifikator</th>
        <th>Email</th>
        <th style="text-align:center">Fullført registrering</th>
      </tr>
    </thead>
    <tbody style="font-size:18px">
      {#each registers.filter((r) => !searchText || Object.values(r).some((v) => typeof v === 'string' && v.includes(searchText))) as register (register._id)}
        <tr>
          <th>{register.identifier}</th>
          <th>{register.email}</th>
          <th style="text-align:center">
            {register.user ? 'Nei' : 'Ja'}
          </th>
          <th style="text-align:right">
            <button
              class="btn btn-outline-secondary"
              disabled={!register.user}
              on:click={() => deleteRegister(register._id)}
              style="margin: 10px 0">Slett</button
            >
          </th>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
