// js/core/PlayerLoadout.js
(function (global) {
  const Game = global.Game || (global.Game = {});
  Game.Core = Game.Core || {};

  /**
   * Returns the ability loadout for a given role.
   * For now: everyone gets [1]=MELEE, [2]=CAST, [3]=HEAL.
   */
  Game.Core.getLoadoutForRole = function getLoadoutForRole(role) {
    const Abilities = Game.Core.AbilityDefs;
    // TODO:
    // if (role === Game.Core.PlayerRole.TANK)   return [...]
    // if (role === Game.Core.PlayerRole.HEALER) return [...]
    // etc.
    return [
      Abilities.MELEE,
      Abilities.CAST,
      Abilities.HEAL
    ];
  };
})(window);
