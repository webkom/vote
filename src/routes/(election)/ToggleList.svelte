<script lang="ts">
  import type { IAlternative } from '$backend/types/types';

  export let alternatives: IAlternative[] = [];
  export let priorities: IAlternative[] = [];

  $: isChosen = (alternative: IAlternative) =>
    priorities.length && priorities[0]._id === alternative._id;

  const toggleAlternative = (alternative: IAlternative) => {
    if (isChosen(alternative)) {
      priorities = [];
    } else {
      priorities = [alternative];
    }
  };
</script>

<ul class="list-unstyled">
  {#each alternatives as alternative (alternative.description)}
    <li
      on:click={() => toggleAlternative(alternative)}
      on:keydown={() => toggleAlternative(alternative)}
    >
      <div class="content" class:selected={isChosen(alternative)}>
        <p>{alternative.description}</p>
      </div>
    </li>
  {/each}
</ul>

<style lang="scss">
  @import '../../variables.scss';

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
    transition: all 0.3s ease-in-out;

    &:hover {
      cursor: pointer;
    }

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

      &.selected {
        background-color: rgba($alternative-background, 0.4);

        p {
          color: white;
        }
      }
    }
  }
</style>
