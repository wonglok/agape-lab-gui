import { useEffect, useRef } from "react";
import { useMeta } from "./useMeta";

export function JoyStick() {
  let ref = useRef();
  let game = useMeta((r) => r.game);
  useEffect(() => {
    class Dynamic {
      constructor({ game }) {
        this.game = game;

        this.cleans = [];
        this.core = {
          onClean: (v) => {
            this.cleans.push(v);
          },
        };
        this.dispose = () => {
          let tt = setInterval(() => {
            if (this.cleans.length > 0) {
              clearInterval(tt);
              this.cleans.forEach((t) => t());
            }
          });
        };

        import("nipplejs")
          .then((s) => {
            return s.default;
          })
          .then((nip) => {
            //
            this.dynamic = nip.create({
              color: "white",
              zone: ref.current,
              mode: "dynamic",
            });

            this.core.onClean(() => {
              this.dynamic.destroy();
            });

            this.dynamic.on("added", (evt, nipple) => {
              this.dynamic.on("start move end dir plain", (evta, data) => {
                if (evta.type === "start") {
                  this.game.keyState.joyStickDown = true;
                }

                // let distance = this.core.now.controls.getDistance()
                // let speed = 1

                if (data?.angle?.radian) {
                  //
                  // //
                  // if (data?.direction?.angle === 'up') {
                  //   this.game.keyState.joyStickSide = data.angle.radian - Math.PI * 0.5

                  //   this.game.keyState.joyStickPressure =
                  //     (Math.min(Math.abs(data.distance / 50.0) * 4, 5) / 5.0) *
                  //     speed

                  //   //
                  // } else if (data?.direction?.angle === 'right') {
                  //   if (data.direction.y == 'up') {
                  //     this.game.keyState.joyStickSide = data.angle.radian - Math.PI * 0.5
                  //   } else {
                  //     this.game.keyState.joyStickSide =
                  //       data.angle.radian - Math.PI * 2.0 - Math.PI * 0.5
                  //   }

                  //   this.game.keyState.joyStickPressure =
                  //     (Math.min(Math.abs(data.distance / 50.0) * 4, 5) / 5.0) *
                  //     speed
                  // } else if (data?.direction?.angle === 'left') {
                  //   this.game.keyState.joyStickSide = data.angle.radian - Math.PI * 0.5

                  //   this.game.keyState.joyStickPressure =
                  //     (Math.min(Math.abs(data.distance / 50.0) * 4, 5) / 5.0) *
                  //     speed
                  // } else {
                  //   this.game.keyState.joyStickSide = data.angle.radian - Math.PI * 0.5
                  //   this.game.keyState.joyStickPressure =
                  //     (Math.min(Math.abs(data.distance / 50.0) * 4, 5) / 5.0) *
                  //     speed *
                  //     -1.0
                  // }

                  // console.log(data.vector.y)
                  // if (data?.direction?.y == 'up') {
                  //   this.game.keyState.joyStickPressure = data.vector.y
                  // } else if (data?.direction?.y == 'down') {
                  // }

                  this.game.keyState.joyStickPressure = data.vector.y;
                  this.game.keyState.joyStickSide = -data.vector.x * 0.8;

                  if (this.game.keyState.joyStickPressure <= -1) {
                    this.game.keyState.joyStickPressure = -1;
                  }
                  if (this.game.keyState.joyStickPressure >= 1) {
                    this.game.keyState.joyStickPressure = 1;
                  }

                  if (this.game.keyState.joyStickSide >= Math.PI * 0.5) {
                    this.game.keyState.joyStickSide = Math.PI * 0.5;
                  }
                  if (this.game.keyState.joyStickSide <= -Math.PI * 0.5) {
                    this.game.keyState.joyStickSide = -Math.PI * 0.5;
                  }

                  //
                  // this.game.keyState.joyStickAngle = data.angle.radian + Math.PI * 1.5
                }

                if (evta.type === "end") {
                  this.game.keyState.joyStickDown = false;
                }
              });
              nipple.on("removed", () => {
                nipple.off("start move end dir plain");
              });
            });

            //
          });
      }
    }

    if (!game) {
      return;
    }

    let api = new Dynamic({ game });

    return () => {
      api.dispose();
    };
  }, [game]);

  return (
    <div
      ref={ref}
      className=" select-none"
      style={{
        zIndex: 1,
        position: "absolute",
        bottom: `20px`,
        borderRadius: "100%",
        left: `calc(50% - 64px)`,
        width: `calc(64px * 2)`,
        height: `calc(64px * 2)`,
      }}
    >
      <svg
        className="rounded-full shadow-inner shadow-white"
        fill="white"
        height="126px"
        width="126px"
        version="1.1"
        id="Capa_1"
        viewBox="-17.05 -17.05 90.94 90.94"
        stroke="#787878"
        transform="rotate(0)"
        strokeWidth="0.0005683700000000001"
      >
        <g
          id="SVGRepo_bgCarrier"
          strokeWidth="0"
          transform="translate(0,0), scale(1)"
        ></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="#CCCCCC"
          strokeWidth="0.22734800000000002"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <g>
            <path d="M27.918,18.325c5.052,0,9.163-4.11,9.163-9.163C37.081,4.11,32.971,0,27.918,0s-9.163,4.11-9.163,9.162 C18.756,14.215,22.866,18.325,27.918,18.325z M20.918,8.837c0-3.309,2.691-6,6-6c0.552,0,1,0.447,1,1s-0.448,1-1,1 c-2.206,0-4,1.794-4,4c0,0.553-0.448,1-1,1S20.918,9.39,20.918,8.837z"></path>
            <path d="M43.598,13.837h-5.556l0,0c-1.502,3.239-4.513,5.62-8.123,6.28v0.029v1.691v1.268V34c0,1.103-0.897,2-2,2s-2-0.897-2-2 V23.104v-1.268v-1.691v-0.029c-3.61-0.659-6.621-3.04-8.123-6.279h-4.556c-3.485,0-6.321,2.836-6.321,6.321v30.357 c0,3.485,2.835,6.321,6.321,6.321h30.358c3.485,0,6.321-2.836,6.321-6.321V20.158C49.918,16.673,47.083,13.837,43.598,13.837z M27.918,38c2.206,0,4-1.794,4-4v-7.984c2.69,1.45,4.418,4.272,4.418,7.402c0,4.643-3.776,8.419-8.418,8.419 S19.5,38.061,19.5,33.418c0-3.13,1.728-5.952,4.418-7.402V34C23.918,36.206,25.713,38,27.918,38z M15.151,51.837 c-2.077,0-3.767-1.69-3.767-3.768s1.69-3.768,3.767-3.768c2.078,0,3.768,1.69,3.768,3.768S17.229,51.837,15.151,51.837z M15.918,33.837c0-5.15,3.231-9.633,8-11.306v1.276c-3.867,1.607-6.418,5.379-6.418,9.61c0,5.745,4.674,10.419,10.418,10.419 s10.418-4.674,10.418-10.419c0-4.231-2.552-8.004-6.418-9.61v-1.276c4.769,1.673,8,6.155,8,11.306c0,6.617-5.383,12-12,12 S15.918,40.454,15.918,33.837z M36.918,52.837c-0.552,0-1-0.447-1-1s0.448-1,1-1c3.86,0,7-3.141,7-7c0-0.553,0.448-1,1-1 s1,0.447,1,1C45.918,48.8,41.881,52.837,36.918,52.837z"></path>{" "}
          </g>
        </g>
      </svg>
    </div>
  );
}
