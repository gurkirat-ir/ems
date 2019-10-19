<template>
  <v-container fill-height style="height: calc(100vh - 58px);">
    <v-layout align-center>
      <v-flex text-center>
        <h1 class="display-2 black--text">Whoops, 404</h1>
        <br />
        <p>The page you were looking for does not exist</p>
        <br />
        <br />
        <br />
        <v-btn :to="{ name: 'dashboard' }" outlined color="black"
          >Get me out of here!</v-btn
        >
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "FourOhFour"
};
</script>
