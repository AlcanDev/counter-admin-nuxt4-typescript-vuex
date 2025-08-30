<template>
  <div>
    <header class="app-header"><slot name="header" /></header>
    <main class="container stack"><slot /></main>
    <footer class="app-footer section"><slot name="footer" /></footer>
  </div>
</template>
