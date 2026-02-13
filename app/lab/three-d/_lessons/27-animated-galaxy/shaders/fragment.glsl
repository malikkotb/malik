varying vec3 vColor;


 void main()
{

    // Disc pattern on particles
    // float strength = distance(gl_PointCoord, vec2(0.5));
    // strength = step(0.5, strength);
    // strength = 1.0 - strength;

    // you can also just send a texture, which is sometimes more efficient than doing the math in the shader.

    // Diffuse pattern on particles
    // float strength = distance(gl_PointCoord, vec2(0.5));
    // strength *= 2.0;
    // strength = 1.0 - strength;


    // Light point pattern on particles
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 10.0); 

    // Final color
    vec3 color = mix(vec3(0.0), vColor, strength);

    gl_FragColor = vec4(color, strength);

    #include <colorspace_fragment>
}