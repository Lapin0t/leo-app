import("stdfaust.lib");

process = pm.violinModel(length, 0.5, 0.5, pos)
with {
  length = vslider("length", 0.5, 0, 10, 0.01) : si.smoo;
    pos = vslider("pos", 0.5, 0, 1, 0.01) : si.smoo;
};
