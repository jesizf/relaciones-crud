const path = require("path");
const db = require("../database/models");
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment =require("moment");

//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;

const moviesController = {
  list: (req, res) => {
    db.Movie.findAll({include:['genre','actors']})
    .then((movies) => {
       
      return res.render("moviesList.ejs", { movies });
    });
  },
  detail: (req, res) => {
    db.Movie.findByPk(req.params.id, {include:['genre','actors']}).then((movie) => {
      res.render("moviesDetail.ejs", { movie });
    });
  },
  new: (req, res) => {
    db.Movie.findAll({
      order: [["release_date", "DESC"]],
      limit: 5,
    }).then((movies) => {
      res.render("newestMovies", { movies });
    });
  },
  recomended: (req, res) => {
    db.Movie.findAll({
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    }).then((movies) => {
      res.render("recommendedMovies.ejs", { movies });
    });
  },
  //Aqui dispongo las rutas para trabajar con el CRUD
  add: function (req, res) {
    db.Genre.findAll({
      order: [["name"]],
    })
      .then((allGenres) => {
        res.render("moviesAdd", { allGenres });
      })
      .catch((error) => console.log(error));
  },
  create: function (req, res) {
    const { title, awards, rating, release_date, length, genre_id } = req.body;
    db.Movie.create({
      title: title.trim(),
      rating,
      awards,
      release_date,
      length,
      genre_id,
    })
      .then((movie) => {
        return res.redirect("/movies");
      })
      .catch((error) => console.log(error));
  },
  edit: function (req, res) {
    let Movie = db.Movie.findByPk(req.params.id);
    let allGenres = db.Genre.findAll({
      order: [["name"]],
    })
    Promise.all([Movie, allGenres])
      .then(([Movie, allGenres]) => {
       /* Movie={
              ...Movie,
              release_date = moment(Movie.release_date)
              .add(1, "d")
              .format("YYYY-MM-DD"),
          }*/
        res.render("moviesEdit", {
          Movie,
          allGenres,
          release_date: moment(Movie.release_date).add(1,'d').format("YYYY-MM-DD"),
        });
      })
      .catch((error) => console.log(error));
  },
  update: function (req, res) {
    const { title, awards, rating, release_date, length } = req.body;
    db.Movie.update(
      {
        title: title.trim(),
        rating,
        awards,
        release_date:moment(release_date).add(1,'d').format("YYYY-MM-DD"),
        length,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    )
      .then(() => {
        return res.redirect("/movies/detail/" + req.params.id);
      })
      .catch((error) => console.log(error));
  },
  delete: function (req, res) {
    db.Movie.findByPk(req.params.id)
      .then((Movie) => res.render("moviesDelete", { Movie }))
      .catch((error) => console.log(error));
  },
  destroy: function (req, res) {
    db.Movie.destroy({
      where: {
        id: req.params.id,
      },
    })
      .then(() => {
        return res.redirect("/movies");
      })
      .catch((error) => console.log(error));
  },
};

module.exports = moviesController;
