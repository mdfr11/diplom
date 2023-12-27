<template>
  <span class="bg"></span>
  <v-app>
    <v-container class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="8" lg="6">
          <v-card class="pa-md-6">
            <v-card-title class="text-h5 pa-md-4">Transaction Checker</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="checkTransaction">
                <v-text-field label="Transaction ID" v-model="txId" outlined required></v-text-field>

                <v-select :items="directions" label="Direction" v-model="txDirection" outlined required></v-select>

                <v-btn :disabled="loading" color="teal-darken-3" type="submit">
                  <v-progress-circular indeterminate color="white" size="20" v-if="loading"></v-progress-circular>
                  Check Transaction
                </v-btn>
              </v-form>
              <v-alert v-if="result !== null" :type="result ? 'error' : 'success'" class="mt-3">
                Transaction is <strong>{{ result ? 'fraudulent' : 'not fraudulent' }}</strong>.
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<style>
.bg {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: url('~@/assets/cool-background.png') no-repeat center center;
  background-size: cover;
  background-color: rgb(255, 255, 255);
}

.v-card {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}

.bg {
  animation: moveBg 30s linear infinite;
  background-attachment: fixed;
}

@keyframes moveBg {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.v-alert {
  border-radius: 5px;
  font-weight: bold;
}

.v-text-field.v-text-field--outlined .v-input__control {
  transition: all 0.3s ease;
}

.v-text-field.v-text-field--outlined .v-input__control:hover {
  background-color: #f5f5f5;
}

.v-text-field.v-text-field--outlined .v-input__control:focus-within {
  background-color: white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}
</style>

<script>
export default {
  name: 'App',
  data() {
    return {
      txId: '0xe88bed952a5de33cb1b67a1680ba7c196fdf1d2b613fe7703d2f7583eb35a02f',
      txDirection: 'out',
      result: null,
      loading: false,
      directions: ['in', 'out']
    }
  },
  methods: {
    checkTransaction() {
      const apiUrl = process.env.VUE_APP_API_URL;

      this.loading = true;
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txId: this.txId, direction: this.txDirection }),
      })
        .then(response => response.json())
        .then(data => {
          this.loading = false;
          this.result = data.prediction;
        })
        .catch((error) => {
          console.error('Error:', error);
          this.loading = false;
          this.result = null;
        });
    }
  }
}
</script>
