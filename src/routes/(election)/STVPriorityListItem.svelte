<script lang="ts">
  export let alternative: { description: string };
  export let index = 0;
  export let onRemove: () => void = () => {};
</script>

<div class="number">
  {index + 1}
</div>
<div class="content">
  <div class="drag"><i class="fa fa-bars" data-testid="drag" /></div>
  <div class="text-wrapper">
    <p>{alternative.description}</p>
  </div>
</div>
<div class="icon remove" on:click={onRemove} on:keypress={onRemove}>
  <i class="fa fa-close" data-testid="remove" />
</div>

<style lang="scss">
  @import '../../variables.scss';

  .content {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    text-align: center;

    .text-wrapper {
      flex: 1;
    }

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

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    height: 100%;
    width: 50px;
    transition: box-shadow 0.2s ease-in-out;

    &:hover {
      box-shadow: 0 12px 16px 0 rgba(0, 0, 0, 0.24),
        0 17px 50px 0 rgba(0, 0, 0, 0.19);
    }

    &.remove {
      color: $abakus-dark;
      background-color: rgba($abakus-dark, 0.4);
    }
  }

  .number {
    position: absolute;
    top: 0;
    left: -25px;
    margin-right: 10px;
    font-size: 35px;
    color: $abakus-dark;
    display: inline-block;
    text-align: center;
  }

  .content {
    cursor: move;
    p {
      user-select: none;
      -webkit-touch-callout: none;
      width: 90%;
    }
  }
  .drag {
    margin-left: 10px;
  }
</style>
