const URL_API = "https://pokeapi.co/api/v2";

let listaPokemon = [];

let luchador1 = null;

let luchador2 = null;

let hpLuchador1 = 0;

let hpLuchador2 = 0;

let hpMaximo1 = 0;

let hpMaximo2 = 0;

let batallaIniciada = false;

const busqueda1 = document.getElementById("busqueda1");

const busqueda2 = document.getElementById("busqueda2");

const sugerencias1 = document.getElementById("sugerencias1");

const sugerencias2 = document.getElementById("sugerencias2");

const pokemon1 = document.getElementById("pokemon1");

const pokemon2 = document.getElementById("pokemon2");

const inicioBatalla = document.getElementById("inicioBatalla");

const mensajeBatalla = document.getElementById("mensajeBatalla");

async function obtenerListaPokemon() {
    try {
        const respuesta = await fetch(`${URL_API}/pokemon?limit=1000`);

        if (!respuesta.ok) {
            throw new Error("No se pudo obtener la lista de Pokémon");
        }

        const datos = await respuesta.json();

        listaPokemon = datos.results;

    } catch (error) {
        console.error(error);
    }
}

async function obtenerPokemon(nombre) {
    try {
        const respuesta = await fetch(`${URL_API}/pokemon/${nombre}`);

        if (!respuesta.ok) {
            throw new Error("No se pudo obtener el Pokémon");
        }

        const datos = await respuesta.json();

        return datos;

    } catch (error) {
        console.error(error);
    }
}

function debounce(funcion, tiempo) {
    let temporizador;

    return function () {
        clearTimeout(temporizador);

        temporizador = setTimeout(function () {
            funcion();
        }, tiempo);
    };
}

function buscarPokemon(texto, contenedor, numeroLuchador) {
    contenedor.innerHTML = "";

    if (texto.trim() === "") {
        return;
    }

    const coincidencias = listaPokemon.filter(function (pokemon) {
        return pokemon.name.includes(texto.toLowerCase());
    });

    const primerosResultados = coincidencias.slice(0, 5);

    if (primerosResultados.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron Pokémon</p>";
        return;
    }

    primerosResultados.forEach(function (pokemon) {
        const boton = document.createElement("button");

        boton.textContent = pokemon.name;

        boton.addEventListener("click", async function () {
            const datosPokemon = await obtenerPokemon(pokemon.name);

            if (datosPokemon) {
                seleccionarPokemon(datosPokemon, numeroLuchador);
            }

            contenedor.innerHTML = "";
        });

        contenedor.appendChild(boton);
    });
}

function buscarPokemon1() {
    buscarPokemon(
        busqueda1.value,
        sugerencias1,
        1
    );
}

function buscarPokemon2() {
    buscarPokemon(
        busqueda2.value,
        sugerencias2,
        2
    );
}

function agregarMovimientos(numeroLuchador) {

    let contenedor;

    if (numeroLuchador === 1) {
        contenedor = pokemon1;
    } else {
        contenedor = pokemon2;
    }

    const botones = contenedor.querySelectorAll(".movimiento");

    botones.forEach(function (boton) {

        boton.addEventListener("click", function () {

            const movimiento = boton.dataset.movimiento;

            atacar(numeroLuchador, movimiento);
        });
    });
}

function mostrarPokemon(numeroLuchador) {

    let datos;

    let hpActual;

    let hpMaximo;

    if (numeroLuchador === 1) {

        datos = luchador1;
        hpActual = hpLuchador1;
        hpMaximo = hpMaximo1;

    } else {

        datos = luchador2;
        hpActual = hpLuchador2;
        hpMaximo = hpMaximo2;
    }


    const nombre = datos.name;

    const imagen = datos.sprites.front_default;

    const tipo = datos.types[0].type.name;

    const movimientos = datos.moves.slice(0, 4);


    const porcentajeHP = (hpActual / hpMaximo) * 100;


    let claseHP = "hp-alto";

    if (porcentajeHP <= 25) {

        claseHP = "hp-bajo";

    } else if (porcentajeHP <= 50) {

        claseHP = "hp-medio";
    }

    let botonesMovimientos = "";

    movimientos.forEach(function (movimiento) {

        botonesMovimientos += `
            <button
                class="movimiento"
                data-movimiento="${movimiento.move.name}"
                ${batallaIniciada ? "" : "disabled"}
            >
                ${movimiento.move.name}
            </button>
        `;
    });

    const contenido = `
        <div class="tarjeta-pokemon">

            <h3>${nombre}</h3>

            <img
                src="${imagen}"
                alt="Imagen de ${nombre}"
            >

            <p class="tipo">
                Tipo: ${tipo}
            </p>

            <div class="informacion-hp">

                <span>
                    HP
                </span>

                <span>
                    ${hpActual} / ${hpMaximo}
                </span>

            </div>

            <div class="barra-hp">

                <div
                    class="hp ${claseHP}"
                    style="width: ${porcentajeHP}%"
                ></div>

            </div>

            <h4>Movimientos</h4>

            <div class="movimientos">
                ${botonesMovimientos}
            </div>

        </div>
    `;

    if (numeroLuchador === 1) {
        pokemon1.innerHTML = contenido;
    } else {
        pokemon2.innerHTML = contenido;
    }

    agregarMovimientos(numeroLuchador);
}

function comprobarLuchadores() {

    if (luchador1 !== null && luchador2 !== null) {

        inicioBatalla.innerHTML = `
            <button id="botonBatalla" class="boton-principal">
                Iniciar batalla
            </button>
        `;

        const botonBatalla = document.getElementById("botonBatalla");

        botonBatalla.addEventListener("click", iniciarBatalla);
    } else {

        inicioBatalla.innerHTML = "";
    }
}

function seleccionarPokemon(datos, numeroLuchador) {

    const hp = datos.stats.find(function (estadistica) {
        return estadistica.stat.name === "hp";
    }).base_stat;

    if (numeroLuchador === 1) {

        luchador1 = datos;

        hpLuchador1 = hp;

        hpMaximo1 = hp;

        busqueda1.value = datos.name;

    } else {

        luchador2 = datos;

        hpLuchador2 = hp;

        hpMaximo2 = hp;

        busqueda2.value = datos.name;
    }

    mostrarPokemon(numeroLuchador);

    comprobarLuchadores();
}

function iniciarBatalla() {

    batallaIniciada = true;

    busqueda1.disabled = true;

    busqueda2.disabled = true;

    sugerencias1.innerHTML = "";
    
    sugerencias2.innerHTML = "";

    inicioBatalla.innerHTML = "<h2>¡Batalla iniciada!</h2>";

    mensajeBatalla.innerHTML = "";

    mostrarPokemon(1);

    mostrarPokemon(2);
}

function reiniciarJuego() {

    luchador1 = null;

    luchador2 = null;

    hpLuchador1 = 0;

    hpLuchador2 = 0;

    hpMaximo1 = 0;

    hpMaximo2 = 0;

    batallaIniciada = false;

    busqueda1.value = "";

    busqueda2.value = "";

    busqueda1.disabled = false;

    busqueda2.disabled = false;

    sugerencias1.innerHTML = "";

    sugerencias2.innerHTML = "";

    pokemon1.innerHTML = "";

    pokemon2.innerHTML = "";

    inicioBatalla.innerHTML = "";

    mensajeBatalla.innerHTML = "";
}

function terminarBatalla(ganador) {

    batallaIniciada = false;

    mostrarPokemon(1);

    mostrarPokemon(2);

    mensajeBatalla.innerHTML = 
    `
        <h2>
            ¡${ganador.name} ganó la batalla!
        </h2>

        <button
            id="botonReiniciar"
            class="boton-principal"
        >
            Jugar de nuevo
        </button>
    `;

    const botonReiniciar = document.getElementById("botonReiniciar");

    botonReiniciar.addEventListener("click", reiniciarJuego);
}

function atacar(numeroLuchador, movimiento) {

    if (!batallaIniciada) {
        return;
    }

    const minimo = 5;

    const maximo = 15;

    const rango = maximo - minimo + 1;

    const dano = Math.floor(Math.random() * rango) + minimo;

    if (numeroLuchador === 1) {

        hpLuchador2 = hpLuchador2 - dano;

        if (hpLuchador2 < 0) {
            hpLuchador2 = 0;
        }

        mensajeBatalla.textContent = `${luchador1.name} usó ${movimiento} e hizo ${dano} de daño.`;

        mostrarPokemon(2);

        if (hpLuchador2 === 0) {
            terminarBatalla(luchador1);
        }

    } else {

        hpLuchador1 = hpLuchador1 - dano;

        if (hpLuchador1 < 0) {
            hpLuchador1 = 0;
        }

        mensajeBatalla.textContent = `${luchador2.name} usó ${movimiento} e hizo ${dano} de daño.`;

        mostrarPokemon(1);

        if (hpLuchador1 === 0) {
            terminarBatalla(luchador2);
        }
    }
}

busqueda1.addEventListener("input", debounce(buscarPokemon1, 300));

busqueda2.addEventListener("input", debounce(buscarPokemon2, 300));

obtenerListaPokemon();

