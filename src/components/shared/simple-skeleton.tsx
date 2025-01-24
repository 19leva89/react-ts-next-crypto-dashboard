interface SimpleSkeletonProps {
	height?: string
}

export const SimpleSkeleton = ({ height }: SimpleSkeletonProps) => {
	return <div className="bg-slate-200 animate-pulse h-64 w-full rounded-xl" />
}
