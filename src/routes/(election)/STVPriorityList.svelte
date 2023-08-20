<script lang="ts">
  import Sortable from 'sortablejs';
  import { onMount } from 'svelte';
  import StvPriorityListItem from './STVPriorityListItem.svelte';
  import type { IAlternative } from '$backend/types/types';

  export let priorities: IAlternative[];

  let ghost: HTMLDivElement;
  let list: HTMLUListElement;

  function handleEnd(event: Sortable.SortableEvent) {
    const { oldIndex, newIndex } = event;
    priorities.splice(newIndex, 0, priorities.splice(oldIndex, 1)[0]);
    priorities = priorities;
  }

  onMount(async () => {
    new Sortable(list, {
      delayOnTouchOnly: true,
      // Handle bugs out. check if newer versions fix this
      // group: 'shared',
      animation: 100,
      onEnd: (e) => handleEnd(e),
      setData: (dataTransfer) => {
        // Remove drag image
        dataTransfer.setDragImage(ghost, 0, 0);
      },
    });
  });
</script>

<ul data-testid="priorities" class="list-unstyled numbered" bind:this={list}>
  {#each priorities as alternative, index (alternative._id)}
    <li>
      <StvPriorityListItem
        {index}
        {alternative}
        onRemove={() =>
          (priorities = priorities.filter((e) => e._id !== alternative._id))}
      />
    </li>
  {/each}
</ul>

<div class="ghost" bind:this={ghost}>HELLO</div>

<style lang="scss">
  @import '../../variables.scss';

  .numbered {
    min-height: initial;
  }
  ul {
    min-height: 60px;
    text-align: right;
  }
  ul li {
    margin-bottom: 10px;
    height: 60px;
    border-radius: 2px;
    background-color: rgba($alternative-background, 0.15);
    display: flex;
    justify-content: space-between;
    margin-left: auto;

    position: relative;
    transition: 0.3s ease-in-out;
    transition-property: background-color, box-shadow;

    &:hover {
      cursor: pointer;
      background-color: rgba($alternative-background, 0.4);
      box-shadow: 0 0 11px rgba(33, 33, 33, 0.2);
    }
  }

  .ghost {
    visibility: hidden;
    position: absolute;
    top: 0;
    left: 0;
  }

  :global(.sortable-drag) {
    opacity: 0 !important;
  }

  :global(.sortable-chosen) {
    cursor: pointer;
    background-color: rgba($alternative-background, 0.4);
    box-shadow: 0 0 11px rgba(33, 33, 33, 0.2);
  }
</style>
