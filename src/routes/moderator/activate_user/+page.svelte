<script lang="ts">
  import scanner from '$lib/utils/scanner';
  import { onMount } from 'svelte';

  //   onMount(async () => {
  //     const port = window.navigator.serial.requestPort({});
  //     console.log('Test');
  //     await port.open({ baudRate: 9600 });
  //   });

  let u: number | string[] = 0;

  onMount(() => {
    scanner.init();
  });
</script>

<p>
  <button on:click={scanner.init}>Lets go</button>
</p>
