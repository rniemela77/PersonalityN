<script setup>
</script>

<template>
  <nav class="top-nav">
    <a class="brand" href="/">PersonalityN</a>
    <div class="links">
      <RouterLink to="/signin">Sign In</RouterLink>
      <RouterLink to="/signup">Sign Up</RouterLink>
    </div>
  </nav>
  <main class="content">
    <RouterView />
  </main>
</template>

<style scoped>
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eaeaea;
}
.brand {
  font-weight: 600;
  text-decoration: none;
  color: inherit;
}
.links {
  display: flex;
  gap: 0.75rem;
}
.content {
  padding: 1rem;
}
</style>
