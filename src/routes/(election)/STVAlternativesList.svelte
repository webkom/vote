<script lang="ts">
  import type { IAlternative } from '$backend/types/types';

  export let alternatives: IAlternative[] = [];
  export let priorities: IAlternative[] = [];

  $: possibleAlternatives = alternatives.filter(
    (alternative) => !priorities.includes(alternative)
  );
  const selectAlternative = (alternative: IAlternative) => {
    priorities = [...priorities, alternative];
    console.log(priorities);
  };
</script>

<ul class="list-unstyled">
  {#each possibleAlternatives as alternative}
    <li
      on:click={() => selectAlternative(alternative)}
      on:keypress={() => selectAlternative(alternative)}
    >
      <div class="content">
        <p>{alternative.description}</p>
      </div>
      <div class="icon add">
        <i class="fa fa-plus" />
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
      background-color: rgba($alternative-background, 0.4);
      box-shadow: 0 0 11px rgba(33, 33, 33, 0.2);
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
    }

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 2px;
      height: 100%;
      width: 15%;
      transition: box-shadow 0.2s ease-in-out;

      &:hover {
        box-shadow: 0 12px 16px 0 rgba(0, 0, 0, 0.24),
          0 17px 50px 0 rgba(0, 0, 0, 0.19);
      }
      &.add {
        color: green;
        background-color: rgba(green, 0.4);
      }
    }
  }
</style>
