{ pkgs }: with pkgs; {
    deps = [
        yarn
        esbuild
        nodejs-16_x
				gh

        nodePackages.typescript
        nodePackages.typescript-language-server
    ];
}