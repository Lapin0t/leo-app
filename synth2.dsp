import("stdfaust.lib");

slerp(x,a,b) = a + (3*x^2 - 2*x^3)*(b - a);

perlin(N) = slerp(i/Nx, i*sin(a)/Nx, (i-Nx)*sin(b)/Nx)
with {
  Nx = max(1,N);
  i = _ ~ ((_+1) % Nx);
  b = _ ~ select2(i<1, _, (no.noise+1)*ma.PI);
  a = _ ~ select2(i<1, _, b');
};

osc(i, fm, am) = hgroup("osc %i", out)
with {
  out_pre = noise_o, saw_o, pulse_o, sin_o : ba.selectn(4, t);
  out = (out_pre + off) * amp;

  t = vslider("type[style:menu{'perlin':0;'saw':1;'pulse':2;'sin':3}]", 0, 0, 3, 1);
  f_knob = vslider("freq", 440, 0.1, 10000, 0.01) : si.smoo;
  a_knob = vslider("amp", 1, -10, 10, 0.01) : si.smoo;
  off = vslider("offset", 0, -1, 1, 0.01) : si.smoo;
  duty = vslider("pulse duty", 0.5, 0, 1, 0.01) : si.smoo;
  
  freq = f_knob + fm;
  amp = a_knob + am;

  noise_o = perlin(ba.sec2samp(1/freq)) : fi.resonhp(freq, 2, 1);
  saw_o = os.sawtooth(freq);
  pulse_o = os.pulsetrain(freq, duty);
  sin_o = os.osc(freq);
};

env(i, t) = hgroup("env %i", en.ar(a, r, t))
with {
  a = vslider("atk", 0.1, 0, 1, 0.01);
  r = vslider("rel", 0.1, 0, 1, 0.01);
};

// M: modulation inputs; N: modulation parameters
matrix(M, N) =
  hgroup("matrix", si.bus(M) <: par(i, N,
	vgroup("[%i]", par(j, M,
	  _ * nentry("%j>%i[style:knob]", 0, -100, 100, 0.01) : si.smoo
    ) :> _ )
  ));

mk_osc_table(no, ne) =
  matrix(no+ne+1, 2*no+ne+6) ~ hgroup(".",
			vgroup("[0]oscs", par(i, no, osc(i))),
		    vgroup("[1]envs", (par(i, ne, env(i)), resonator(0)))
  ) : ba.selector(2*no+ne+5, 2*no+ne+6);

table = hgroup("synth", mk_osc_table(2, 3));

resonator(i, fm, am, m_A, m_B, exc) = hgroup("res %i", out * (am + knob_a))
with {
  out = (flute_o, clarinet_o, guitar_o, box_o) : ba.selectn(4, t);
  t = vslider("type[style:menu{'flute':0;'clarinet':1,'guitar':2,'box':3}]", 0, 0, 3, 1);
	
  knob_f = vslider("freq", 440, 40, 4000, 0.01) : si.smoo;
  knob_a = vslider("amp", 1, -10, 10, 0.01) : si.smoo;
  
  freq = knob_f + fm;
  len = pm.f2l(freq);
  
  k_A = vslider("A", 0.5, 0, 1, 0.01) : si.smoo;
  k_B = vslider("B", 0.5, 0, 1, 0.01) : si.smoo;
  
  A = k_A + m_A;
  B = k_B + m_B;

  flute_o = pm.fluteModel(len, A, exc);          // A: mouth pos
  clarinet_o = pm.clarinetModel(len, exc, B, A); // A: opening; B: reed stiffness
  guitar_o = pm.guitarModel(len, A, exc);        // A: pluck pos
  box_o = pm.modeInterpRes(40, 2*A, 2*B, exc);        // A: shape, B: scale
};

process = table;
