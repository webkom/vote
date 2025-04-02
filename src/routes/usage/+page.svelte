<script lang="ts">
  import usage from '../../../usage.yml';
</script>

<div class="center text-center">
  <div class="usage-flex">
    <h2>Anledninger</h2>
    <a href="/">← Tilbake</a>
  </div>
  {#each usage as usageEntry}
    <hr />
    <div class="usage-flex">
      <h3>{usageEntry.what}</h3>
      <h4>{usageEntry.when}</h4>
    </div>
    <div class="usage-flex">
      <h5>Organisasjon:</h5>
      <h5>{usageEntry.who}</h5>
    </div>
    <div class="usage-flex">
      <h5>Antall brukere:</h5>
      <h5>{usageEntry.users}</h5>
    </div>
  {/each}
</div>

<style lang="scss">
  .usage-flex {
    display: flex;
    justify-content: space-between;
    margin: 0 10px;

    h3 {
      font-weight: bold;
    }

    a {
      align-self: flex-end;
    }
  }
</style>
