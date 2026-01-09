perl -0777 -pi -e '
  s/\Q$7)\E/((defined $taskRef && $taskRef =~ m(^#[0-9A-F]{6}$)i) ? $taskRef : undef))/g
' ~/desktop/theexpanse/theexpansev005/backend/TSE/TanukiEngine/MechanicalBrain_v2.js
