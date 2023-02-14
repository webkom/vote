<div class="container">
  <div class="row justify-content-center">
    <div class="col-xs-12 col-sm-4 col-sm-offset-4 col-md-4 text-center">
      <video
        id="testing"
        muted="muted"
        playsinline="playsinline"
        style="width: 100%"
      /><br />
      <form action="/auth/login" method="post">
        <input type="hidden" name="_csrf" />
        <div class="form-group">
          <label for="username">Brukernavn:</label>
          <input class="form-control" name="username" type="text" />
        </div>
        <div class="form-group">
          <label for="password">Passord:</label>
          <input class="form-control" name="password" type="password" />
        </div>
        <input hidden name="usingToken" value="false" />
        <div class="hidden" id="alertInfo">
          <img id="qrImg" width="50%" />
          <div class="alert alert-danger">
            <p><b>Velkommen til VOTE</b></p>
            <p>
              Ta <b>screenshot</b> av denne siden for å lagre brukernavn og passord
            </p>
          </div>
        </div>
        <button class="btn btn-default" type="submit">Logg på</button>
      </form>
      <br />
      <div class="hidden" id="confirmScreenshot">
        <button class="btn btn-default">Jeg har tatt screenshot</button>
      </div>
    </div>
  </div>
</div>
