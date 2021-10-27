<template>
  <v-app>
    <v-app-bar dark height="70" fixed>
      <v-row>
        <v-toolbar-title class="ml-5" style="font-size: xx-large">
          Monitor de Terminal de Consulta
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-title style="font-size: xx-large">
          Lojas Online <a style="color: green">{{ qtOnline }}</a>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-title style="font-size: xx-large">
          Lojas Offline <a style="color: red">{{ qtOffline }}</a>
        </v-toolbar-title>
        <v-spacer></v-spacer>
      </v-row>
    </v-app-bar>
    <v-col style="margin-top: 90px" class="justify-center">
      <v-row>
        <table class="styled-table rounded">
          <thead>
            <tr>
              <th class="text-center">Loja</th>
              <th class="text-center">Conexão</th>
              <th class="text-center">IP Servidor</th>
              <th class="text-center">Quantidade</th>
              <th class="text-center">IP dos Terminais</th>
            </tr>
          </thead>
          <tbody class="">
            <tr v-for="item in resultado.terminais" :key="item.Index">
              <td class="text-center">
                {{ item.Index }}
              </td>
              <td class="text-center">
                <a v-if="item.Estado" style="color: green">
                  <b>Online</b>
                </a>
                <a v-else style="color: red">
                  <b>Offline</b>
                </a>
              </td>
              <td class="text-center">
                {{ item.Loja }}
              </td>
              <td class="text-center">
                {{ item.Lista.length }}
              </td>
              <td class="text-center">
                <v-tooltip left>
                  <template v-slot:activator="{ on, attrs }">
                    <label v-bind="attrs" v-on="on"><b>Visualizar</b></label>
                  </template>
                  <span v-for="l in item.Lista" :key="l"> {{ l }}<br /></span>
                </v-tooltip>
              </td>
            </tr>
          </tbody>
        </table>
      </v-row>
    </v-col>
  </v-app>
</template>

<script>
import API from "axios";
import { mapState } from "vuex";
export default {
  name: "Home",
  components: {},
  data() {
    return {
      resultado: {
        terminais: [],
        hosts: [],
      },
      estado: "",
      ActiveCor: "#000",
      qtOnline: 0,
      qtOffline: 0,
    };
  },
  mounted() {
    this.VerificarLojasOnline();
    this.Carregar();
    this.TimeOutAPI();
  },
  methods: {
    async Carregar() {
      await API.get(`${this.URL}/TerminaisLojas`)
        .then((response) => {
          this.resultado = response.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },

    async TimeOutAPI() {
      await this.sleep(4000).then(() => {
        console.log(this.resultado);
      });
      this.VerificarLojasOnline();
      this.Carregar();
      this.TimeOutAPI();
    },

    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    //verifica se as lojas estão online.
    VerificarLojasOnline() {
      this.qtOnline = 0;
      this.qtOffline = 0;
      for (this.item of this.resultado.terminais) {
        !this.item.Estado ? this.qtOffline++ : this.qtOnline++;
      }
    },
  },
  computed: {
    ...mapState(["URL"]),
  },
};
</script>

<style>
.styled-table {
  border-collapse: collapse;
  margin: 25px 0;
  font-size: 0.9em;
  font-family: sans-serif;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  width: 1200px;
  margin-left: auto;
  margin-right: auto;
}
/*importante*/
.styled-table thead tr {
  border-bottom: 2px solid #009879;
  color: #000000;
  text-align: left;
}

.styled-table th,
.styled-table td {
  padding: 12px 15px;
}

.styled-table tbody tr {
  border-bottom: 1px solid #dddddd;
}

.styled-table tbody tr:nth-of-type(even) {
  background-color: #f3f3f3;
}

.styled-table tbody tr:last-of-type {
  border-bottom: 2px solid #009879;
}

.styled-table tbody tr.active-row {
  font-weight: bold;
  color: #009879;
}
</style>