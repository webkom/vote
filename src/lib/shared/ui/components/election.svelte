<script>
  //get active election from API, currently hardcoded
  const activeElection = {
    title: 'Election Title',
    description: 'Election Description',
    type: 'stv',
  };

  export let electionExists = true;
  export let errorCode = '';
  export let confirmVote = false;
  export let priorities = [];
  export let electionType = 'normal';
  export let alternatives = [
    { _id: '1', description: 'Alternative Description STV1' },
    { _id: '2', description: 'Alternative Description STV2' },
  ];
</script>

<div class="center text-center">
  {#if electionExists}
    <div>
      {#if !errorCode}
        <div ng-switch-when="" ng-switch="confirmVote">
          {#if !confirmVote}
            <div>
              <div class="election-info">
                <h2>Election Title<!-- {{ activeElection.title }} --></h2>
                <p>
                  Election Description<!-- {{ activeElection.description }} -->
                </p>
              </div>
              {#if electionType == 'stv'}
                <!-- STV election-->
                <!-- ----------------------------------------------------------------->
                <div class="alternatives">
                  <ul class="list-unstyled">
                    <li
                      ng-repeat="alternative in getPossibleAlternatives()"
                      ng-click="selectAlternative(alternative)"
                    >
                      <div class="content">
                        <p>
                          Alternative Description STV1<!-- {{ alternative.description }} -->
                        </p>
                      </div>
                      <div
                        class="icon add"
                        ng-click="deselectAlternative(alternative._id)"
                      >
                        <i class="fa fa-plus" />
                      </div>
                    </li>
                  </ul>
                </div>
                <div class="alternatives">
                  <h3>Din prioritering</h3>
                  <p class="helptext" ng-if="priorities.length == 0">
                    <em>Velg et alternativ fra listen</em>
                  </p>
                  <ul
                    class="list-unstyled numbered"
                    sortable="sortable"
                    sortable-on-update="updatePriority"
                    sortable-list="priorities"
                    sortable-animation="100"
                    sortable-delay="0"
                    sortable-handle=".content"
                  >
                    <li
                      ng-repeat="alternative in priorities track by alternative._id"
                    >
                      <div class="content">
                        <div class="drag"><i class="fa fa-bars" /></div>
                        <div>
                          <p>
                            Alternative Description STV2<!-- {{ alternative.description }} -->
                          </p>
                        </div>
                      </div>
                      <div
                        class="icon remove"
                        ng-click="deselectAlternative(alternative._id)"
                      >
                        <i class="fa fa-close" />
                      </div>
                    </li>
                  </ul>
                </div>
                <!-- --------------------------------------------------------------------->
                <!-- NORMAL type election view-->
                <!-- --------------------------------------------------------------------->
              {:else if electionType == 'normal'}
                <div class="alternatives">
                  <h3>Alternativer</h3>
                  <ul class="list-unstyled">
                    <li
                      ng-repeat="alternative in activeElection.alternatives"
                      ng-click="toggleAlternative(alternative)"
                    >
                      <div class="content">
                        <!-- ng-class="{&quot;selected&quot;: isChosen(alternative)}" -->
                        <p>
                          Alternative Description Normal<!-- {{ alternative.description }} -->
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                <!-- --------------------------------------------------------------------->
              {/if}
              <button
                class="btn btn-lg btn-default"
                type="button"
                ng-click="confirm()"
                >Voting Submission Text<!-- {{ priorities.length === 0 ? "Stem blank" : "Avgi stemme" }} --></button
              >
              <div />
              <button
                class="btn btn-sm btn-danger"
                type="button"
                ng-click="reset()">Reset</button
              >
            </div>
          {:else if confirmVote}
            <div ng-switch-when="true">
              <h3>Bekreft din stemme</h3>
              <div class="confirmVotes" ng-switch="priorities.length === 0">
                <div class="ballot">
                  <div ng-switch-when="true">
                    <h3>Blank stemme</h3>
                    <i
                      >Din stemme vil fortsatt påvirke hvor mange stemmer som
                      kreves for å vinne</i
                    >
                  </div>
                  <div ng-switch-when="false">
                    <ol>
                      <li
                        class="confirm-pri"
                        ng-repeat="alternative in priorities"
                      >
                        <p>
                          Alternative Description<!-- {{ alternative.description }} -->
                        </p>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
              <button
                class="btn btn-lg btn-danger"
                type="button"
                ng-click="denyVote()">Avbryt</button
              >
              <button
                class="btn btn-lg btn-success"
                type="button"
                ng-click="vote()">Bekreft</button
              >
            </div>
          {/if}
        </div>
      {:else if errorCode == 'InvalidAccessCodeError'}
        <div class="access-code">
          <form
            class="form-group enter-code-form"
            ng-submit="getActiveElection(accessCode)"
            name="enterCodeForm"
          >
            <div class="form-group access-code" required="required">
              <label>Kode</label>
              <input
                class="form-control"
                type="number"
                name="accessCode"
                ng-model="accessCode"
                placeholder="----"
              />
            </div>
            <button
              class="btn btn-default btn-lg btn-success"
              id="submit"
              type="submit"
              ng-disabled="accessCode.toString().length != 4">Verifiser</button
            >
          </form>
        </div>
      {:else if errorCode == 'InactiveUserError'}
        <div>
          <h1>Din bruker er ikke aktivert.</h1>
          <p>Gå til kortleseren ved utgangen for å aktivere brukeren din.</p>
        </div>
      {/if}
    </div>
  {:else if !electionExists}
    <div>
      <h2>Ingen aktive avstemninger.</h2>
      <p>
        Denne siden oppdateres automatisk når en ny avstemning er tilgjenglig.
      </p>
    </div>
  {/if}
</div>
