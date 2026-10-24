<script setup lang="ts"></script>

<template>
  <main class="min-h-dvh bg-(--auth-background) dark:bg-(--background-inverse)">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in" appear>
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>
</template>
