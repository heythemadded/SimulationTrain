/************************************************************/
/**
 * Université Sorbonne Paris Nord, Programmation Web
 * Auteurs                       : Étienne André
 * Création                      : 2023/12/11
 * Dernière modification         : 2024/04/25
 */
/************************************************************/

'use strict'

/************************************************************/
/* Constantes */
/************************************************************/

/*------------------------------------------------------------*/
// Dimensions du plateau
/*------------------------------------------------------------*/

// Nombre de cases par défaut du simulateur
const LARGEUR_PLATEAU	= 30;
const HAUTEUR_PLATEAU	= 15;

// Dimensions des cases par défaut en pixels
const LARGEUR_CASE	= 35;
const HAUTEUR_CASE	= 40;


/*------------------------------------------------------------*/
// Types des cases
/*------------------------------------------------------------*/
class Type_de_case{
	static Foret = new Type_de_case('forêt');

	static Eau = new Type_de_case('eau');

	static Rail_horizontal = new Type_de_case('rail horizontal');

	static Rail_vertical = new Type_de_case('rail vertical');

	// NOTE: faisant la jonction de horizontal à vertical en allant vers la droite puis vers le haut (ou de vertical vers horizontal en allant de bas vers gauche)
	static Rail_droite_vers_haut	= new Type_de_case('Rail allant de droite vers le haut');

	// NOTE: faisant la jonction de vertical à horizontal en allant vers le haut puis vers la droite (ou de horizontal à vertical en allant de gauche vers le bas)
	static Rail_haut_vers_droite	= new Type_de_case('Rail allant du haut vers la droite');

	// NOTE: faisant la jonction de horizontal à vertical en allant vers la droite puis vers le bas (ou de vertical vers horizontal en allant de haut vers gauche)
	static Rail_droite_vers_bas		= new Type_de_case('Rail allant de la droite vers le bas');

	// NOTE: faisant la jonction de vertical à horizontal en allant vers le bas puis vers la droite (ou de horizontal à vertical en allant de gauche vers le haut)
	static Rail_bas_vers_droite		= new Type_de_case('Rail allant du bas vers la droite');

	static Locomotive = new Type_de_case('locomotive');
    static Wagon = new Type_de_case('wagon');

	constructor(nom) {
		this.nom = nom;
	}
}



/*------------------------------------------------------------*/
// Images
/*------------------------------------------------------------*/
const IMAGE_EAU = new Image();
IMAGE_EAU.src = 'images/eau.png';

const IMAGE_FORET = new Image();
IMAGE_FORET.src = 'images/foret.png';

const IMAGE_LOCO = new Image();
IMAGE_LOCO.src = 'images/locomotive.png';

const IMAGE_RAIL_HORIZONTAL = new Image();
IMAGE_RAIL_HORIZONTAL.src = 'images/rail-horizontal.png';

const IMAGE_RAIL_VERTICAL = new Image();
IMAGE_RAIL_VERTICAL.src = 'images/rail-vertical.png';

const IMAGE_RAIL_BAS_VERS_DROITE = new Image();
IMAGE_RAIL_BAS_VERS_DROITE.src = 'images/rail-bas-vers-droite.png';

const IMAGE_RAIL_DROITE_VERS_BAS = new Image();
IMAGE_RAIL_DROITE_VERS_BAS.src = 'images/rail-droite-vers-bas.png';

const IMAGE_RAIL_DROITE_VERS_HAUT = new Image();
IMAGE_RAIL_DROITE_VERS_HAUT.src = 'images/rail-droite-vers-haut.png';

const IMAGE_RAIL_HAUT_VERS_DROITE = new Image();
IMAGE_RAIL_HAUT_VERS_DROITE.src = 'images/rail-haut-vers-droite.png';

const IMAGE_WAGON = new Image();
IMAGE_WAGON.src = 'images/wagon.png';


/************************************************************/
// Variables globales
/************************************************************/

let plateau;
let simulateur;
let contexte;
let cases = [];
let trains = [];
let boutons = [
    document.getElementById('bouton_foret'),
    document.getElementById('bouton_eau'),
    document.getElementById('bouton_rail_horizontal'),
    document.getElementById('bouton_rail_vertical'),
    document.getElementById('bouton_rail_droite_vers_haut'),
    document.getElementById('bouton_rail_haut_vers_droite'),
    document.getElementById('bouton_rail_droite_vers_bas'),
    document.getElementById('bouton_rail_bas_vers_droite'),
	document.getElementById('bouton_train_1'),
	document.getElementById('bouton_train_2'),
	document.getElementById('bouton_train_4'),
	document.getElementById('bouton_train_6'),
];
/************************************************************/
/* Classes */
/************************************************************/

/*------------------------------------------------------------*/
// Plateau
/*------------------------------------------------------------*/

class Plateau{
	/* Constructeur d'un plateau vierge */
	constructor(){
		this.largeur = LARGEUR_PLATEAU;
		this.hauteur = HAUTEUR_PLATEAU;

		// NOTE: à compléter…

		// État des cases du plateau
		// NOTE: tableau de colonnes, chaque colonne étant elle-même un tableau de cases (beaucoup plus simple à gérer avec la syntaxe case[x][y] pour une coordonnée (x,y))
		this.cases = [];
		for (let x = 0; x < this.largeur; x++) {
			this.cases[x] = [];
			for (let y = 0; y < this.hauteur; y++) {
				this.cases[x][y] = Type_de_case.Foret;
			}
		}
	}

	modifierCase(x, y, type_de_case) {
		if (x >= 0 && x < this.largeur && y >= 0 && y < this.hauteur) {
			this.cases[x][y] = type_de_case;
		}
	}
}
// ----------- Classe Train
class Train {
    constructor(x, y, longueur) {
        this.positions = [{ x, y}];
        this.longueur = longueur;
        this.direction = 'droite';
        for (let i = 1; i < longueur; i++) {
            this.positions.push({ x: x - i, y });
        }
		this.inter=null;
    }

    avancer() {
        const nouvellePosition = { ...this.positions[0] };
        if (this.direction === 'droite') {
            nouvellePosition.x++;
        } else if (this.direction === 'gauche') {
            nouvellePosition.x--;
        } else if (this.direction === 'haut') {
            nouvellePosition.y--;
        } else if (this.direction === 'bas') {
            nouvellePosition.y++;
        }

        this.positions.unshift(nouvellePosition);
		
        if (this.verifierExplosion()) {
            while(this.positions.length>0){
				this.supprimerCase();
			}
        }
        this.mettreAJourDirection();
		this.dessiner();
		this.supprimerCase();
    }

	
    mettreAJourDirection() {
		const pos = this.positions[0];
        const typeDeCase = plateau.cases[pos.x][pos.y];
        switch (typeDeCase) {
            case Type_de_case.Rail_droite_vers_haut:
				if(pos.y != this.positions[1].y){
					this.direction = 'gauche';
				}else{
					this.direction = 'haut';
				}
				break;
            case Type_de_case.Rail_haut_vers_droite:
				if(pos.y != this.positions[1].y){
					this.direction = 'droite';
				}else{
					this.direction = 'bas';
				}
                break;
            case Type_de_case.Rail_droite_vers_bas:
				if(pos.y != this.positions[1].y){
					this.direction = 'gauche';
				}else{
					this.direction = 'bas';
				}
                break;
            case Type_de_case.Rail_bas_vers_droite:
				if(pos.y != this.positions[1].y){
					this.direction = 'droite';
				}else{
					this.direction = 'haut';
				}
                break;
        }
    }

    dessiner() {
        this.positions.forEach((position, index) => {
            const type = (index === 0) ? Type_de_case.Locomotive : Type_de_case.Wagon;
            const image = image_of_case(type);
            contexte.drawImage(image, position.x * LARGEUR_CASE, position.y * HAUTEUR_CASE, LARGEUR_CASE, HAUTEUR_CASE);
        });
		
    }

	supprimerCase(){
		const dernierePosition = this.positions[this.positions.length - 1];
        contexte.drawImage(image_of_case(plateau.cases[dernierePosition.x][dernierePosition.y]),dernierePosition.x * LARGEUR_CASE, dernierePosition.y * HAUTEUR_CASE, LARGEUR_CASE, HAUTEUR_CASE);
		this.positions.pop();
	}

    verifierExplosion() {
        const position = this.positions[0];
		console.log(position.x < 0 || position.x >= LARGEUR_PLATEAU || position.y < 0 || position.y >= HAUTEUR_PLATEAU || plateau.cases[position.x][position.y] === Type_de_case.Eau || plateau.cases[position.x][position.y] === Type_de_case.Foret);
        return (position.x < 0 || position.x >= LARGEUR_PLATEAU || position.y < 0 || position.y >= HAUTEUR_PLATEAU || plateau.cases[position.x][position.y] === Type_de_case.Eau || plateau.cases[position.x][position.y] === Type_de_case.Foret);
    }
	stop(){
		clearInterval(this.inter);
	}

    move(){
        this.inter = setInterval(() => {
            this.avancer();
        }, 500);
    }
}


/************************************************************/
// Méthodes
/************************************************************/

function image_of_case(type_de_case){
	switch(type_de_case){
		case Type_de_case.Foret					: return IMAGE_FORET;
		case Type_de_case.Eau					: return IMAGE_EAU;
		case Type_de_case.Rail_horizontal		: return IMAGE_RAIL_HORIZONTAL;
		case Type_de_case.Rail_vertical			: return IMAGE_RAIL_VERTICAL;
		case Type_de_case.Rail_droite_vers_haut	: return IMAGE_RAIL_DROITE_VERS_HAUT;
		case Type_de_case.Rail_haut_vers_droite	: return IMAGE_RAIL_HAUT_VERS_DROITE;
		case Type_de_case.Rail_droite_vers_bas	: return IMAGE_RAIL_DROITE_VERS_BAS;
		case Type_de_case.Rail_bas_vers_droite	: return IMAGE_RAIL_BAS_VERS_DROITE;
		case Type_de_case.Locomotive: return IMAGE_LOCO;
        case Type_de_case.Wagon: return IMAGE_WAGON;
    }
}


function dessine_case(contexte, plateau, x, y){
	let la_case = plateau.cases[x][y];
	let image_a_afficher;
	image_a_afficher = image_of_case(la_case);
	contexte.drawImage(image_a_afficher, x * LARGEUR_CASE, y * HAUTEUR_CASE, LARGEUR_CASE, HAUTEUR_CASE);
}

function dessine_plateau(page, plateau){
	// Dessin du plateau avec paysages et rails
	for (let x = 0; x < plateau.largeur; x++) {
		for (let y = 0; y < plateau.hauteur; y++) {
			dessine_case(page, plateau, x, y);
		}
	}

	// NOTE: à compléter…
}

document.getElementById('bouton_foret').addEventListener('click', () => selectConstructionMode(Type_de_case.Foret));
document.getElementById('bouton_eau').addEventListener('click', () => selectConstructionMode(Type_de_case.Eau));
document.getElementById('bouton_rail_horizontal').addEventListener('click', () => selectConstructionMode(Type_de_case.Rail_horizontal));
document.getElementById('bouton_rail_vertical').addEventListener('click', () => selectConstructionMode(Type_de_case.Rail_vertical));
document.getElementById('bouton_rail_droite_vers_haut').addEventListener('click', () => selectConstructionMode(Type_de_case.Rail_droite_vers_haut));
document.getElementById('bouton_rail_haut_vers_droite').addEventListener('click', () => selectConstructionMode(Type_de_case.Rail_haut_vers_droite));
document.getElementById('bouton_rail_droite_vers_bas').addEventListener('click', () => selectConstructionMode(Type_de_case.Rail_droite_vers_bas));
document.getElementById('bouton_rail_bas_vers_droite').addEventListener('click', () => selectConstructionMode(Type_de_case.Rail_bas_vers_droite));

let mode_construction;
let longueurTrain;

document.getElementById('bouton_train_1').addEventListener('click', () => {
	longueurTrain=1;
	selectConstructionMode(Type_de_case.Locomotive,'bouton_train_1')});
document.getElementById('bouton_train_2').addEventListener('click', () => {
	longueurTrain=2;
	selectConstructionMode(Type_de_case.Locomotive,'bouton_train_2')});
document.getElementById('bouton_train_4').addEventListener('click', () => {
	longueurTrain=4;
	selectConstructionMode(Type_de_case.Locomotive,'bouton_train_4')});
document.getElementById('bouton_train_6').addEventListener('click', () => {
	longueurTrain=6;
	selectConstructionMode(Type_de_case.Locomotive,'bouton_train_6')});


function selectConstructionMode(type_de_case, boutonID = null) {

	if (boutonID !== null) {
		boutons.forEach(bouton => bouton.disabled = false);
		boutons.filter(bouton => bouton.id === boutonID).forEach(bouton => bouton.disabled=true);
		mode_construction='train';
	}else{
		boutons.forEach(bouton => bouton.disabled = false);
		boutons.filter(bouton => bouton.alt.toUpperCase() === type_de_case.nom.toUpperCase()).forEach(bouton => bouton.disabled = true);
		mode_construction=type_de_case;
	}
}

document.getElementById('simulateur').addEventListener('click', (event) => {
    const rect = document.getElementById('simulateur').getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const x = Math.floor(mouseX / LARGEUR_CASE);
    const y = Math.floor(mouseY / HAUTEUR_CASE);
	
	if(mode_construction ==='train'){
		if (peutAjouterTrain(x, y, longueurTrain)) {
			ajouterTrain(x, y, longueurTrain);
		}else {
			console.log('Impossible d\'ajouter le train ici.');
		}
	}else{
		plateau.modifierCase(x,y,mode_construction);
		dessine_case(contexte, plateau,x,y);
	}
});

function ajouterTrain(x, y, longueurTrain) {

    let newTrain = new Train(x, y, longueurTrain);
    trains.push(newTrain);
	newTrain.dessiner(contexte);
	newTrain.move();
	//--- Résoudre le 2x vitesse ici
}


function peutAjouterTrain(x, y, longueurTrain) {

	if (x - longueurTrain + 1 < 0 || y >= plateau.hauteur) {
		return false;
	}
	for (let i = 0; i < longueurTrain; i++) {
		if (plateau.cases[x - i][y] !== Type_de_case.Rail_horizontal) {
			return false;
		}
	}
	return true;
}

// --------------------- gestion du button pause 

document.getElementById('bouton_pause').addEventListener('click',(event)=>togglePause());

let enPause = false;
let i=0; // ------------------- Problème si on ajoute un train après le premier pause. ( 2x Vitesse )
let trainInterval;


function togglePause() {
    enPause = !enPause; 
    const boutonPause = document.getElementById('bouton_pause');
    boutonPause.textContent = enPause ? "Redémarrer" : "Pause";
	
    if (enPause) {
		if( i===0 ){
			trains.forEach(train => {
				train.stop();
			});
			i++;
		}else{
			clearInterval(trainInterval);
		}
        
	}else {
		if(trains != null){
    	    demarrerSimulation();
		}
    }
}

function demarrerSimulation() {
    trainInterval = setInterval(() => {
        moveAllTrains();
    }, 500); 
}

function moveAllTrains() {
    trains.forEach(train => {
        train.avancer();
    });
}

// TODO : d'autres méthodes si besoin


/************************************************************/
// Auditeurs
/************************************************************/

// TODO


/************************************************************/
// Plateau de jeu initial
/************************************************************/


// NOTE : ne pas modifier le plateau initial
function cree_plateau_initial(plateau){
	// Circuit
	plateau.cases[12][7] = Type_de_case.Rail_horizontal;
	plateau.cases[13][7] = Type_de_case.Rail_horizontal;
	plateau.cases[14][7] = Type_de_case.Rail_horizontal;
	plateau.cases[15][7] = Type_de_case.Rail_horizontal;
	plateau.cases[16][7] = Type_de_case.Rail_horizontal;
	plateau.cases[17][7] = Type_de_case.Rail_horizontal;
	plateau.cases[18][7] = Type_de_case.Rail_horizontal;
	plateau.cases[19][7] = Type_de_case.Rail_droite_vers_haut;
	plateau.cases[19][6] = Type_de_case.Rail_vertical;
	plateau.cases[19][5] = Type_de_case.Rail_droite_vers_bas;
	plateau.cases[12][5] = Type_de_case.Rail_horizontal;
	plateau.cases[13][5] = Type_de_case.Rail_horizontal;
	plateau.cases[14][5] = Type_de_case.Rail_horizontal;
	plateau.cases[15][5] = Type_de_case.Rail_horizontal;
	plateau.cases[16][5] = Type_de_case.Rail_horizontal;
	plateau.cases[17][5] = Type_de_case.Rail_horizontal;
	plateau.cases[18][5] = Type_de_case.Rail_horizontal;
	plateau.cases[11][5] = Type_de_case.Rail_haut_vers_droite;
	plateau.cases[11][6] = Type_de_case.Rail_vertical;
	plateau.cases[11][7] = Type_de_case.Rail_bas_vers_droite;

	// Segment isolé à gauche
	plateau.cases[0][7] = Type_de_case.Rail_horizontal;
	plateau.cases[1][7] = Type_de_case.Rail_horizontal;
	plateau.cases[2][7] = Type_de_case.Rail_horizontal;
	plateau.cases[3][7] = Type_de_case.Rail_horizontal;
	plateau.cases[4][7] = Type_de_case.Rail_horizontal;
	plateau.cases[5][7] = Type_de_case.Eau;
	plateau.cases[6][7] = Type_de_case.Rail_horizontal;
	plateau.cases[7][7] = Type_de_case.Rail_horizontal;

	// Plan d'eau
	for(let x = 22; x <= 27; x++){
		for(let y = 2; y <= 5; y++){
			plateau.cases[x][y] = Type_de_case.Eau;
		}
	}

	// Segment isolé à droite
	plateau.cases[22][8] = Type_de_case.Rail_horizontal;
	plateau.cases[23][8] = Type_de_case.Rail_horizontal;
	plateau.cases[24][8] = Type_de_case.Rail_horizontal;
	plateau.cases[25][8] = Type_de_case.Rail_horizontal;
	plateau.cases[26][8] = Type_de_case.Rail_bas_vers_droite;
	plateau.cases[27][8] = Type_de_case.Rail_horizontal;
	plateau.cases[28][8] = Type_de_case.Rail_horizontal;
	plateau.cases[29][8] = Type_de_case.Rail_horizontal;

	// TCHOU
	plateau.cases[3][10] = Type_de_case.Eau;
	plateau.cases[4][10] = Type_de_case.Eau;
	plateau.cases[4][11] = Type_de_case.Eau;
	plateau.cases[4][12] = Type_de_case.Eau;
	plateau.cases[4][13] = Type_de_case.Eau;
	plateau.cases[4][13] = Type_de_case.Eau;
	plateau.cases[5][10] = Type_de_case.Eau;

	plateau.cases[7][10] = Type_de_case.Eau;
	plateau.cases[7][11] = Type_de_case.Eau;
	plateau.cases[7][12] = Type_de_case.Eau;
	plateau.cases[7][13] = Type_de_case.Eau;
	plateau.cases[8][10] = Type_de_case.Eau;
	plateau.cases[9][10] = Type_de_case.Eau;
	plateau.cases[8][13] = Type_de_case.Eau;
	plateau.cases[9][13] = Type_de_case.Eau;

	plateau.cases[11][10] = Type_de_case.Eau;
	plateau.cases[11][11] = Type_de_case.Eau;
	plateau.cases[11][12] = Type_de_case.Eau;
	plateau.cases[11][13] = Type_de_case.Eau;
	plateau.cases[12][11] = Type_de_case.Eau;
	plateau.cases[13][10] = Type_de_case.Eau;
	plateau.cases[13][11] = Type_de_case.Eau;
	plateau.cases[13][12] = Type_de_case.Eau;
	plateau.cases[13][13] = Type_de_case.Eau;

	plateau.cases[15][10] = Type_de_case.Eau;
	plateau.cases[15][11] = Type_de_case.Eau;
	plateau.cases[15][12] = Type_de_case.Eau;
	plateau.cases[15][13] = Type_de_case.Eau;
	plateau.cases[16][10] = Type_de_case.Eau;
	plateau.cases[16][13] = Type_de_case.Eau;
	plateau.cases[17][10] = Type_de_case.Eau;
	plateau.cases[17][11] = Type_de_case.Eau;
	plateau.cases[17][12] = Type_de_case.Eau;
	plateau.cases[17][13] = Type_de_case.Eau;

	plateau.cases[19][10] = Type_de_case.Eau;
	plateau.cases[19][11] = Type_de_case.Eau;
	plateau.cases[19][12] = Type_de_case.Eau;
	plateau.cases[19][13] = Type_de_case.Eau;
	plateau.cases[20][13] = Type_de_case.Eau;
	plateau.cases[21][10] = Type_de_case.Eau;
	plateau.cases[21][11] = Type_de_case.Eau;
	plateau.cases[21][12] = Type_de_case.Eau;
	plateau.cases[21][13] = Type_de_case.Eau;
}

/************************************************************/
// Fonction principale
/************************************************************/

function tchou(){
	console.log("Tchou, attention au départ !");
	/*------------------------------------------------------------*/
	// Variables DOM
	/*------------------------------------------------------------*/
	contexte = document.getElementById('simulateur').getContext("2d");
	// NOTE: ce qui suit est sûrement à compléter voire à réécrire intégralement
	plateau = new Plateau();
	cree_plateau_initial(plateau);
	// Dessine le plateau
	dessine_plateau(contexte, plateau);
}

/************************************************************/
// Programme principal
/************************************************************/
// NOTE: rien à modifier ici !
window.addEventListener("load", () => {
	// Appel à la fonction principale
	tchou();
});
