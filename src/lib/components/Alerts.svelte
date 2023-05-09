<script lang="ts">
  import { alerts } from '$lib/stores';
  import { fade } from 'svelte/transition';
</script>

<div class="center">
  {#each $alerts as alert (alert.id)}
    <div
      role="alert"
      class="alert alert-dismissible"
      class:alert-warning={alert.type === 'WARNING'}
      class:alert-danger={alert.type === 'ERROR'}
      class:alert-success={alert.type === 'SUCCESS'}
      transition:fade={{ duration: alert.fade ? alerts.FADE_DURATION : 0 }}
    >
      {alert.message}
      <button
        class="btn-close"
        aria-label="Close"
        on:click={() => {
          alerts.dismiss(alert.id);
        }}
      />
    </div>
  {/each}
</div>
