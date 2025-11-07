import BaseChapterScene from "./BaseChapterScene.js";
import NPC from "../NPC.js";
import Portal from "../Portal.js";
import { gameData } from "../data/game-data.js";

export default class Chapter3_1Scene extends BaseChapterScene {
  constructor() {
    super("Chapter3-1Scene");
  }

  create() {
    const sceneData = gameData.scenes["Chapter3-1Scene"];
    super.create(sceneData);

    sceneData.entities.forEach((entityData) => {
      let entity;
      switch (entityData.type) {
        case "NPC":
          entity = new NPC(
            this,
            entityData.x,
            entityData.y,
            entityData.name,
            entityData.dialog,
            entityData.isStatic,
            entityData.quiz,
            null,
            entityData.imageName
          );
          this.physics.add.collider(entity, this.platforms);
          break;
        case "Portal":
          entity = new Portal(
            this,
            entityData.x,
            entityData.y,
            50,
            100,
            entityData.targetScene,
            entityData.entryX
          );
          break;
      }
      if (entity) {
        this.entities.add(entity);
      }
    });
  }
}
