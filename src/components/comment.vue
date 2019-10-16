<template>
  <div>
    <strong class="blue--text">
      <a :href="`mailto:${email}`">{{ username }}</a> </strong
    >&nbsp;&nbsp;
    <span style="font-family: monospace">[{{ time }}]</span>
    <br />
    <pre>{{ content }}</pre>
  </div>
</template>

<script>
export default {
  props: ["username", "email", "time", "content"]
};
</script>

<style></style>
