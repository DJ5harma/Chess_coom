export const FormattedMoves = ({ history }: { history: string[] }) => {
	const res: [string, string][] = [];

	for (let i = 0; i < history.length; i += 2)
		res.push([history[i], history[i + 1]]);

	return ( 
		<div
			className="flex flex-col w-full h-full"
			style={{ maxHeight: "40vh" }}
		>
			<div className="w-full flex justify-around bg-white text-black [&>p]:min-w-20 [&>p]:text-center">
				<p>Move</p>
				<p>White</p>
				<p>Black</p>
			</div>
			<div className="overflow-auto w-full" style={{scrollbarWidth: "thin"}}>
				{res.reverse().map(([white, black], i) => {
                    const [color1, color2, color3] = i === 0 ? ["bg-neutral-800", "bg-black", "text-white"] : ["bg-blue-800", "bg-blue-950", "text-white"];
					return (
						<div
							key={i}
							className={"flex w-full border-t-2 border-white [&>p]:w-full [&>p]:text-center [&>p]:p-2 "+color3}
						>
							<p className={color2}>
								{Math.ceil(history.length / 2) - i}.
							</p>
							<p className={color1}>{white}</p>
							<p className={color2}>{black}</p>
						</div>
					);
				})}
			</div>
		</div>
	);
};
