<script lang="ts">
  import type { ElectionType } from '$backend/types/types';
  import { alerts } from '$lib/stores';
  import { getElections } from '$lib/utils/adminApi';
  import { ResponseResult } from '$lib/utils/callApi';
  import { onMount } from 'svelte';

  let elections: ElectionType[] = [];

  onMount(async () => {
    const res = await getElections();
    if (res.result === ResponseResult.SUCCESS) {
      elections = res.body;
    } else {
      alerts.push(res.body.message, 'ERROR');
    }
  });
</script>

<div class="bg-light p-5 center">
  <div class="flex-column elections-list ">
    <div><span>Navn</span><span>Status</span></div>
    <ul data-testid="elections">
      {#each elections as election}
        <li>
          <a class="elections-list" href="admin/election/{election._id}/edit">
            <div>
              <span>{election.title}</span>
              <span>
                {election.active ? 'Aktiv' : 'Ikke Aktiv'}
              </span>
            </div>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style lang="scss">
  @import '../../variables.scss';

  .elections-list {
    width: 100%;
  }

  span {
    padding: 10px;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  ul li {
    &:hover {
      cursor: default;
      background-color: rgba($alternative-background, 0.15);
    }
  }

  div {
    display: flex;
    justify-content: space-between;
  }
</style>
