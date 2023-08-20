<script lang="ts">
  import { cardKeyScanStore } from '$lib/utils/cardKeyScanStore';
  import { onDestroy } from 'svelte';

  const unsubscribe = cardKeyScanStore.subscribe(() => {});
  onDestroy(() => {
    unsubscribe();
  });
</script>

<slot />
